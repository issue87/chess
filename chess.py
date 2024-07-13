from flask import Flask, render_template, request, flash, jsonify, session
import uuid
import copy
import random
from collections import Counter

#main object of application. It is used by Gunicorn
app = Flask(__name__)
app.secret_key = 'fsrghdfhjdjkf456745dfghdfhd'

#figure colors' constants 
WHITE_FIGURE_COLOR = 0
BLACK_FIGURE_COLOR = 1
#figure types' constants
KING_FIGURE = 0
QUEEN_FIGURE = 1 
ROOK_FIGURE = 2 
BISHOP_FIGURE = 3
KNIGHT_FIGURE = 4
PAWN_FIGURE = 5
#player types' constants
HUMAN_PLAYER = 0
COMPUTER_PLAYER = 1
#reasons of a draw
AGREEMENT_OF_PLAYERS = 0
TREEFOLD_REPETITION_OF_MOVES = 1
FIVEFOLD_REPETITION_OF_MOVES = 2
RULE_OF_50_MOVES = 3
RULE_OF_75_MOVES = 4
DEAD_POSITION = 5
STALEMATE = 6
text_representation_draw_resons = {0: "by agreement of the playes",
                                   1: "by threefold repetition of moves",
                                   2: "by fivefold repetition of moves",
                                   3: "according to the 50-move rule",
                                   4: "according to the 75-move rule",
                                   5: "due to dead position",
                                   6: "as a result of a stalemate"}



colors_representations = {0:"white", 1:"black"}
figures_representation = {0:"king", 1: "queen", 2: "rook", 3: "bishop", 4: "knight", 5: "pawn"}
figures_directions = {0: {(1, 0), (1, 1), (1, -1), (0, 1), (-1, 1), (-1, 0), (-1, -1), (0, -1)},
                      1: {(1, 0), (1, 1), (1, -1), (0, 1), (-1, 1), (-1, 0), (-1, -1), (0, -1)},
                      2: {(0, 1), (0, -1), (1, 0), (-1, 0)},
                      3: {(1, 1), (1, -1), (-1, 1), (-1, -1)},
                      4: {(2, 1), (2, -1), (-2, 1), (-2, -1), (1, 2), (-1, 2), (1, -2), (-1, -2)}
                      }
pawns_direction = {0: 1, 1: -1}
initianal_pawn_raw = {0: 1, 1: 6}
initianal_king_pos = {0: (0, 4), 1: (7, 4)}
column_chess_notation = "ABCDEFGH"
games = dict()

class Player:
    """
    Figure class. It has properties color: white or black,
    and kind of a player: human or computer. To prevent a castling when
    a king or a rook have been moved, it also keeps a property if it's available.
    All computer players have different strategies to represent opponents of 
    different levels. Strategy must be passed as an argument.
    """
    def __init__(self, color, type_of_player, strategy = None):
        self.color = color
        self.type_of_player = type_of_player
        self.long_castling_possible = True
        self.short_castling_possible = True
        self.strategy = strategy
        
    def get_color(self):
        return self.color
    
    def get_type_of_player(self):
        return self.type_of_player
    
    def prohibit_long_castling(self):
        self.long_castling_possible = False
    
    def prohibit_short_castling(self):
        self.short_castling_possible = False
        
    def is_long_castling_possible(self):
        return self.long_castling_possible
    
    def is_short_castling_possible(self):
        return self.short_castling_possible
    
    def implement_strategy(self, board, legal_moves, request_for_draw = False):
        move = self.strategy(board, legal_moves, request_for_draw)
        return move
    
    def translate_to_JSON(self):
        return {
            "color": self.color,
            "playerType": self.type_of_player
        }
    
    
class Figure:
    """
    Figure class. It has properties color and kind of a figure. Also a class 
    instance keeps position of a figure. Don't forget to change a pos property
    when a figure moves.
    """
    
    def __init__(self, color, kind, pos):
        self.color = color
        self.kind = kind
        self.pos = pos
        
    def __str__(self):
        result = (figures_representation[self.kind]
                 + "(" + colors_representations[self.color][0] + ")"
                 )
        return result
    
    def get_color(self):
        return self.color
    
    def get_kind(self):
        return self.kind
    
    def get_pos(self):
        return self.pos
    
    def change_pos(self, pos):
        self.pos = pos

    def tranlslate_to_JSON(self):
        return {"color": colors_representations[self.color],
                "kind": figures_representation[self.kind],
                "row_pos": self.pos[0],
                "col_pos": self.pos[1]
               }
        
class ChessBoard:
    """
    Chessboard class. Keeps figures and their positions, what player must move,
    other player, if current player is checked, mated or stalemate happened, 
    eaten figures, positions of the black and the white kings.
    """
    
    def __init__(self, white_player, black_player):
        self.board = [[None for dummy_square in range(8)] for dummy_row in range(8)]
        for column in range(8):
            self.board[1][column] = Figure(WHITE_FIGURE_COLOR, PAWN_FIGURE, (1, column))
        for column in range(8):
            self.board[6][column] = Figure(BLACK_FIGURE_COLOR, PAWN_FIGURE, (6, column))
        self.board[0][0] = Figure(WHITE_FIGURE_COLOR, ROOK_FIGURE, (0, 0))
        self.board[0][7] = Figure(WHITE_FIGURE_COLOR, ROOK_FIGURE, (0, 7))
        self.board[7][0] = Figure(BLACK_FIGURE_COLOR, ROOK_FIGURE, (7, 0))
        self.board[7][7] = Figure(BLACK_FIGURE_COLOR, ROOK_FIGURE, (7, 7))
        self.board[0][1] = Figure(WHITE_FIGURE_COLOR, KNIGHT_FIGURE, (0, 1))
        self.board[0][6] = Figure(WHITE_FIGURE_COLOR, KNIGHT_FIGURE, (0, 6))
        self.board[7][1] = Figure(BLACK_FIGURE_COLOR, KNIGHT_FIGURE, (7, 1))
        self.board[7][6] = Figure(BLACK_FIGURE_COLOR, KNIGHT_FIGURE, (7, 6))
        self.board[0][2] = Figure(WHITE_FIGURE_COLOR, BISHOP_FIGURE, (0, 2))
        self.board[0][5] = Figure(WHITE_FIGURE_COLOR, BISHOP_FIGURE, (0, 5))
        self.board[7][2] = Figure(BLACK_FIGURE_COLOR, BISHOP_FIGURE, (7, 2))
        self.board[7][5] = Figure(BLACK_FIGURE_COLOR, BISHOP_FIGURE, (7, 5))
        self.board[0][3] = Figure(WHITE_FIGURE_COLOR, QUEEN_FIGURE, (0, 3))
        self.board[0][4] = Figure(WHITE_FIGURE_COLOR, KING_FIGURE, (0, 4))
        self.board[7][3] = Figure(BLACK_FIGURE_COLOR, QUEEN_FIGURE, (7, 3))
        self.board[7][4] = Figure(BLACK_FIGURE_COLOR, KING_FIGURE, (7, 4))
        self.en_passant = None
        self.current_player = white_player
        self.other_player = black_player
        self.checked = False
        self.mate = False
        self.draw = False
        self.type_of_draw = None
        self.resigned = False
        self.eaten_figures = set()
        self.kings_pos = {0: (0, 4), 1: (7, 4)}
        self.counter = 0
        self.last_pawn_move_or_eaten = 0
        
    def __str__(self):
        """
        String representation of a board. Useful for debuging
        """
        result = " ".center(5)
        for column_index in range(8):
            result += column_chess_notation[column_index].center(5)
        result += "\n"
        for row_index in range(7, -1, -1):
            result += str(row_index + 1).center(5)
            for square in self.board[row_index]:
                if square == None:
                    result += "None".center(5)           
                else:
                    result += str(square).center(5)           
            result += "\n\n"
        return result
    
    def adjust_last_pawn_move_or_eaten(self):
        """
        Sets last_pawn_move_or_eaten to the current counter value
        """
        self.last_pawn_move_or_eaten = self.counter
    
    def count_turn(self):
        """
        Add 1 to counter after a move
        """
        self.counter += 1
    
    def get_moves_without_pawn_move_or_eaten(self):
        """
        Gets the number of the last moves without 
        pawn moves and eating figures
        """
        return self.counter - self.last_pawn_move_or_eaten
    
    def get_current_player(self):
        """
        Gets the current player
        """
        return self.current_player
     
    def get_opponent_player(self):
        """
        Gets the opponent player
        """
        return self.other_player
    
    def get_player_by_color(self, color):
        """
        Gets a player by color
        """
        if self.current_player.get_color() == color:
            return self.current_player
        else:
            return self.other_player
        
    def set_en_passant(self, pos):
        """
        Sets en passant move to the position possible
        """
        self.en_passant = pos
        
    def promote_pawn(self, pos, promotion_figure_index):
        """
        promotes a pawn, that was moved to the position, 
        one of the figure type constants must be passed a the second argument.
        """
        self.board[pos[0]][pos[1]] = Figure(self.get_opponent_player().get_color(), promotion_figure_index, pos)
        
    def get_en_passant(self):
        """
        gets en passan for outer methods
        """
        return self.en_passant
    
    def switch_players(self):
        """
        Switch players after a move has been done.
        """
        self.current_player, self.other_player = self.other_player, self.current_player
    
    def get_board_square(self, row, column):
        """
        Returns a figure that locates in given coordinates
        """
        assert 0 <= row <= 7
        assert 0 <= column <= 7
        return self.board[row][column]
    
    def translate_board_figures_to_JSON(self):
        copied_figures = []
        for row in self.board:
            for square in row:
                if square != None:
                    copied_figures.append(square.tranlslate_to_JSON());
        return copied_figures

    def make_move(self, figure, position):
        '''
        Changes position of the figure to the given position. If grid contains 
        an enemy figure, the figure is transfered to eaten figures.
        This method leaves the checking whether a move is legal or not 
        upon other methods. Switch players at the end. 
        '''
        previous_position = figure.get_pos()
        if figure.get_kind() == PAWN_FIGURE or self.board[position[0]][position[1]] != None:
            self.adjust_last_pawn_move_or_eaten()
        if figure.get_kind() == PAWN_FIGURE and position == self.en_passant:
            #put the eaten figure via enpassan to eaten figures
            self.eaten_figures.add(self.board[previous_position[0]][self.en_passant[1]])
            self.board[previous_position[0]][self.en_passant[1]] = None
        self.board[previous_position[0]][previous_position[1]] = None 
        figure.change_pos(position)
        if self.board[position[0]][position[1]] is not None:
            self.eaten_figures.add(self.board[position[0]][position[1]])
        self.board[position[0]][position[1]] = figure
        if figure.get_kind() == KING_FIGURE:
            #renews kings position on the board
            self.kings_pos[self.get_current_player().get_color()] = position
            #handle castling
            if abs(previous_position[1] - position[1]) == 2:
                #case of long castling
                if previous_position[1] > position[1]:
                    self.board[position[0]][3] = self.board[position[0]][0]
                    self.board[position[0]][0] = None
                    self.board[position[0]][3].change_pos((0, 3))
                #case of short castling
                else:
                    self.board[position[0]][5] = self.board[position[0]][7]
                    self.board[position[0]][7] = None
                    self.board[position[0]][5].change_pos((0, 5))
        #should a king or rook make their first move, the castling between them
        #must be forbidden
        if self.get_current_player().is_long_castling_possible():
            king_pos = initianal_king_pos[self.get_current_player().get_color()]
            if previous_position == king_pos or previous_position == (king_pos[0], 0):
                self.get_current_player().prohibit_long_castling()
        if self.get_current_player().is_short_castling_possible():
            king_pos = initianal_king_pos[self.get_current_player().get_color()]
            if previous_position == king_pos or previous_position == (king_pos[0], 7):
                self.get_current_player().prohibit_short_castling()
        self.en_passant = None
        if figure.get_kind() == PAWN_FIGURE and abs(previous_position[0] - position[0]) == 2:
            self.set_en_passant((previous_position[0] + pawns_direction[figure.get_color()]
                                , previous_position[1]))
        self.switch_players()
    
    def set_if_check(self):
        '''
        sets check, if the current player is in check
        '''
        king_pos = self.kings_pos[self.get_current_player().get_color()]
        moves = self.get_possible_moves(self.get_opponent_player().get_color()).values()
        for set_of_moves in moves:
            if king_pos in set_of_moves:
                self.checked = True
                return
            
            
    def dismiss_check(self):
        '''
        Dismisses the check after switching players
        '''
        self.checked = False
        
        
    def is_checked(self):
        '''
        returns true if the current played is checked 
        '''
        return self.checked

    def set_if_mate_stalemate(self):
        '''
        Sets up a mate,
        if current player has no moves at all
        and the player is in check.
        Sets up a stalemate, 
        if current player has no moves at all 
        and the player is NOT in check
        '''
        color = self.get_current_player().get_color()
        moves = self.get_possible_moves(color)
        print(self)
        legal_moves = self.get_possible_legal_moves(moves, color).values()
        exist_moves = False
        for moves_set in legal_moves:
            if moves_set != set():
                exist_moves = True
                break
        if not exist_moves:
            if self.checked:
                self.mate = True
            else:
                self.draw = True
                self.type_of_draw = STALEMATE
            
    def is_mate(self):
        '''
        returns true if the curent player is mated 
        '''
        return self.mate
    
    def is_draw(self):
        '''
        returns true if game result is draw
        '''
        return self.draw
    def is_dead_position(self):
        remained_figures = self.get_remained_figures()
        if len(remained_figures[0]) < 3 and len(remained_figures[1]) < 3:
        #sets draw due to dead position in case either
        # of this conditions is true for both players:
        # 1. A player has only one piece: a king
        # 2. A player has a king and a bishop
        # 3. A player has a king and a knight 
            if (len(remained_figures[0]) == 1
                or 3 in remained_figures[0] 
                or 4 in remained_figures[0]
                ) and (
                len(remained_figures[1]) == 1
                or 3 in remained_figures[1] 
                or 4 in remained_figures[1]
                ): return True
        # Sets draw due to dead position if one of the players has 
        # a king and two knights and the other player has only a king
        if (
            (len(remained_figures[0]) == 3 and len(remained_figures[1]) == 1)
            or 
            (len(remained_figures[1]) == 3 and len(remained_figures[0]) == 1)
            ):
            figure_counter_w = Counter(remained_figures[0])
            figure_counter_b = Counter(remained_figures[1])
            if figure_counter_w[4] == 2 or figure_counter_b[4] == 2:
                return True
        return False

    def set_draw_by_agreement(self):
        """
        sets draw by agreement of the parties
        """
        self.draw = True
        self.type_of_draw  = AGREEMENT_OF_PLAYERS
    
    def set_draw_by_75_moves(self):
        """
        sets draw according to 75 moves rule
        """
        self.draw = True
        self.type_of_draw  = RULE_OF_75_MOVES
        
    def set_draw_by_50_moves(self):
        """
        sets draw according to 50 moves rule
        """
        self.draw = True
        self.type_of_draw  = RULE_OF_50_MOVES
    
    def set_draw_due_to_dead_position(self):
        self.draw = True
        self.type_of_draw  = DEAD_POSITION
        
    def get_draw_reason(self):
        """
        Gets the reason of the draw
        """
        return text_representation_draw_resons[self.type_of_draw]
    
    def set_resign(self):
        """
        Set resignation if the current player resigned
        """
        self.resigned = True
        
    #def set_current_player(self, player):
        #self.current_player = player
    def get_possible_legal_moves(self, moves, color):
        """
        checks whether moves make the king checked, checks if there are
        squares between a rook and a king, including the king himself,
        under attack of opponents figures during castling,
        returns only legal moves
        """
        legal_moves = dict() 
        for figure, figure_moves in moves.items():
            legal_moves[figure] = set()
            for move in figure_moves:
                illegal_move = False 
                test_board = copy.deepcopy(self)
                figure_pos = figure.get_pos()
                #figures on the testboard are different from those 
                #on the game board, so we can't refer to game board's figures 
                #from test board
                print(figure, figure_pos, " - ", move)
                test_board.make_move(test_board.get_board_square(figure_pos[0], figure_pos[1]), move)
                kings_position = test_board.kings_pos[color]
                positions_to_check = set()
                positions_to_check.add(kings_position)
                if figure.get_kind() == KING_FIGURE:
                    #determines whether a move is castling
                    if abs(figure_pos[1] - move[1]) > 1:
                        #determines whether is longcastling
                        if figure_pos[1] > move[1]:
                            #During a castling neither the king 
                            #nor squares between the king and the rook
                            #must be under the check.
                            #Note the fuction already checks that
                            #no move leaves the king under the check
                            positions_to_check.add((move[0], 1))
                            positions_to_check.add((move[0], 3))
                            positions_to_check.add((move[0], 4))
                        #othervise short castling
                        else:
                            positions_to_check.add((move[0], 4))
                            positions_to_check.add((move[0], 5))
                opponents_moves = test_board.get_possible_moves(test_board.get_current_player().get_color()).values()
                for moves_of_figure in opponents_moves:
                    for position in positions_to_check: 
                        if position in moves_of_figure:
                            illegal_move = True
                            break
                if not illegal_move:
                    legal_moves[figure].add(move)
            legal_moves[figure]
        return legal_moves
            
    def get_possible_moves(self, color):
        """
        Gets possible moves of figures for a player with given color. 
        Result might contain illegal moves that lead
        to a threat of an attack at the king.
        That moves will be handled in other methods.
        """
        moves = dict()
        for row_index in range(8):
            for column_index in range(8):
                current_figure = self.board[row_index][column_index]
                if (current_figure is not None
                    and self.board[row_index][column_index].get_color() == color):
                    figure_moves = set()
                    if current_figure.get_kind() == KING_FIGURE or current_figure.get_kind() == KNIGHT_FIGURE:
                        for direction in figures_directions[current_figure.get_kind()]:
                            target_row = row_index + direction[0]
                            target_column = column_index + direction[1]
                            #check that potential move doesn't lead out of board 
                            if target_row < 0 or target_column < 0 or target_row > 7 or target_column > 7:
                                continue
                            #check that potential move doesn't eat or blocked by own figure 
                            if self.board[target_row][target_column] is not None:
                                if self.board[target_row][target_column].get_color() == color:
                                    continue
                            figure_moves.add((target_row,
                                             target_column))
                        if current_figure.get_kind() == KING_FIGURE:
                            if self.get_player_by_color(color).is_long_castling_possible():
                                if (self.board[row_index][column_index - 1] is None
                                    and self.board[row_index][column_index - 2] is None
                                    and self.board[row_index][column_index - 3] is None):
                                    figure_moves.add((row_index, column_index - 2))
                            if self.get_player_by_color(color).is_short_castling_possible():
                                if (self.board[row_index][column_index + 1] is None
                                    and self.board[row_index][column_index + 2] is None):
                                    figure_moves.add((row_index, column_index + 2))
                    if current_figure.get_kind() == PAWN_FIGURE:
                        if (self.board[row_index + pawns_direction[color]][column_index]
                            is None):
                            figure_moves.add((row_index + pawns_direction[color],
                                              column_index))
                            if initianal_pawn_raw[color] == row_index:
                                if (self.board[row_index + 2 * pawns_direction[color]][column_index]    
                                    is None):
                                    figure_moves.add((row_index + 2 * pawns_direction[color],
                                                     column_index))
                        if column_index > 0:
                            if self.board[row_index 
                                          + pawns_direction[color]][column_index - 1] is not None:
                                if self.board[row_index 
                                              + pawns_direction[color]][column_index - 1].get_color() != color:
                                    figure_moves.add((row_index + pawns_direction[color],
                                                      column_index - 1)) 
                            if self.en_passant is not None:
                                if (row_index + pawns_direction[color] == self.en_passant[0]
                                    and column_index - 1 == self.en_passant[1]):
                                    figure_moves.add((row_index + pawns_direction[color],
                                                      column_index - 1)) 
                        if column_index < 7:
                            if self.board[row_index 
                                          + pawns_direction[color]][column_index + 1] is not None:
                                if self.board[row_index 
                                              + pawns_direction[color]][column_index + 1].get_color() != color:
                                    figure_moves.add((row_index + pawns_direction[color],
                                                      column_index + 1))
                            if self.en_passant is not None:
                                if (row_index + pawns_direction[color] == self.en_passant[0]
                                    and column_index + 1 == self.en_passant[1]):
                                    figure_moves.add((row_index + pawns_direction[color],
                                                      column_index + 1)) 
                    if (current_figure.get_kind() == QUEEN_FIGURE 
                        or current_figure.get_kind() == BISHOP_FIGURE
                        or current_figure.get_kind() == ROOK_FIGURE
                        ):
                        for direction in figures_directions[current_figure.get_kind()]:
                            target_row = row_index + direction[0]
                            target_column = column_index + direction[1]
                            while True:
                                #check that potential move doesn't lead out of board 
                                if target_row < 0 or target_column < 0 or target_row > 7 or target_column > 7:
                                    break
                                #check that potential move doesn't eat or blocked by own figure 
                                if self.board[target_row][target_column] is not None:
                                    if self.board[target_row][target_column].get_color() == color:
                                        break
                                figure_moves.add((target_row,
                                                 target_column))
                                if self.board[target_row][target_column] is not None:
                                    break
                                target_row += direction[0]
                                target_column += direction[1]
                    moves[current_figure] = figure_moves
        return moves           

    def get_remained_figures(self):
        """
        returns remained figures for every player, 
        where figures are represented by constants:
        "figure types' constants"
        """
        remained_figures = {0:[], 1:[]}
        for raw in self.board:
            for square in raw:
                if square is not None:
                    color = square.get_color()
                    kind = square.get_kind()
                    remained_figures[color].append(kind)
        return remained_figures
                    
                                  
def clean_empty_sets_from_dict(dict_to_clean):
    """
    cleans items, having a value of an empty set, from a dictionary
    """
    cleaned_dict = dict()
    for key, value in dict_to_clean.items():
        if not value == set():
            cleaned_dict[key] = value 
    return cleaned_dict
        
def game_recursive(player1, player2, ex):
    """
    the game. it is alike a loop: 
    it recursively calles itself at the end of a function with the same arguments.
    This function is for testing.
    """
    color = ex.get_current_player().get_color()
    color_str = colors_representations[color]
    if ex.is_mate():
        print(color_str, "is in checkmate")
        return
    if ex.get_moves_without_pawn_move_or_eaten() >= 75:
        ex.set_draw_by_75_moves()
    elif ex.get_moves_without_pawn_move_or_eaten() >= 50:
        if ex.get_opponent_player().get_type_of_player() == HUMAN_PLAYER:
            result = input("Do you want to implement rule 50, if it is so type 'yes'")
            if result == 'yes':
                ex.set_draw_by_50_moves
    if ex.is_dead_position():
        ex.set_draw_due_to_dead_position()         
    if ex.is_draw():
        print ("draw ", ex.get_draw_reason())
        return 
    if ex.is_checked():
        print (color_str, "is in check")
    en_passant_ = ex.get_en_passant()
    if en_passant_ is not None:
        print ("En passant: ", column_chess_notation[en_passant_[1]], en_passant_[0] + 1)
    moves = ex.get_possible_moves(color)
    legal_moves = clean_empty_sets_from_dict(ex.get_possible_legal_moves(moves, color))
    for key, value in legal_moves.items():
        str_represent = ""
        for move in value:
            str_represent = (str_represent + " " 
                             + column_chess_notation[move[1]] 
                             + str(move[0] + 1)
                             )
        print(key, " has moves ", str_represent)
    #end of move
    #checks whether it is check, and if it is true saves result to a board class variable
    chosen_move = ex.get_current_player().implement_strategy(ex, legal_moves)
    if chosen_move == "resign":
        ex.set_resign()
        print(color_str, " resigned")
        return
    if chosen_move == "request_for_draw":
        result = ex.get_opponent_player().implement_strategy(ex, legal_moves, True)
        if result == "draw is accepted":
            ex.set_draw_by_agreement()
            print ("draw by agreement of the parties")
            return
        else:
            print ("proposal of the draw is rejected")
            chosen_move = ex.get_current_player().implement_strategy(ex, legal_moves)
    figure_to_move, to_move, promotion_figure_index = chosen_move
    ex.make_move(figure_to_move, (to_move[0], to_move[1]))
    ex.count_turn()
    if (figure_to_move.get_kind() == PAWN_FIGURE
        and to_move[0] == initianal_king_pos[ex.get_current_player().get_color()][0]):
        ex.promote_pawn((to_move[0], to_move[1]), promotion_figure_index)
    ex.dismiss_check()
    ex.set_if_check()
    ex.set_if_mate_stalemate()
    game_recursive(player1, player2, ex)

def template_for_strategy(board, legal_moves, request_for_draw):
    """
    This is the template for a strategy.
    """
    #By default the draw is rejected.
    #If a request for a draw has been passed, 
    #you must return either "draw is accepted" or "draw is rejected"
    if request_for_draw:
        if False:
            return "draw is accepted"
        else:
            return "draw is rejected"
    #In normal conditions function must return a tuple with:
    # 1. The figure that will be moved.
    # 2. A move where the figure will be moved in a form of a tuple:().
    # 3 An index of figure from "figure types' constants" to which the moving 
    # figure will be promoted to. If there is no promotion, set this variable 
    # to None
    
        
def random_strategy(board, legal_moves, request_for_draw):
    """
    Computer random strategy. 
    """
    if request_for_draw:
        result = random.randrange(0, 2)
        if result == 1:
            return "draw is accepted"
        else:
            return "draw is rejected"
    figure_to_move, figure_moves = random.choice(list(legal_moves.items()))
    to_move = random.choice(list(figure_moves))
    promotion_figure_index = None
    if figure_to_move.get_kind() == PAWN_FIGURE and to_move[0] == initianal_king_pos[board.get_opponent_player().get_color()][0]:
        promotion_figure_index = random.randrange(1,5)
    return (figure_to_move, to_move, promotion_figure_index)

def eater_strategy(board, legal_moves, request_for_draw):
    """
    Just prefers to eat any figures with any figure.
    """
    #By default the draw is rejected.
    #If a request for a draw has been passed, 
    #you must return either "draw is accepted" or "draw is rejected"
    if request_for_draw:
        if False:
            return "draw is accepted"
        else:
            return "draw is rejected"
    selected_dict = dict()
    for figure, moves in legal_moves.items():
        selected_figure_moves = set()
        for move in moves:
            if board.get_board_square(move[0], move[1]) != None:
                selected_figure_moves.add(move)
        if selected_figure_moves != set():
            selected_dict[figure] = selected_figure_moves
    if selected_dict != dict():
        return random_strategy(board, selected_dict, request_for_draw)
    else:
        return random_strategy(board, legal_moves, request_for_draw)

def human_choice(board, legal_moves, request_for_draw):
    """
    Handles interactions with a human player.
    """
    if request_for_draw:
        decision = input("type 1 if you accept the draw, other text you type means you deny the draw")
        if decision == "1":
            return "draw is accepted"
        else:
            return "draw is rejected"
    move = None
    from_move = None 
    to_move = None
    figure_to_move = None
    while True:
        move = input("type: row and column the figure to move. The type row and column where to move.")
        if move == "resign":
            return move
        if move == "draw":
            return "request_for_draw"
        move = move.split()
        from_move = (int(move[0][1]) - 1, column_chess_notation.find(move[0][0]))
        to_move = (int(move[1][1]) - 1, column_chess_notation.find(move[1][0]))
        figure_to_move = board.get_board_square(from_move[0], from_move[1])
        if figure_to_move is None:
            print("you must enter a position of your figure, but you entered an empty position")
            continue
        if figure_to_move.get_color() != board.get_current_player().get_color():
            print("you must enter the position of your figure, not the opponent's one")
            continue
        if figure_to_move not in legal_moves:
            print("The figure ",figure_to_move, move[0] , " position of which you entered has no legal moves")
            continue
        if to_move not in legal_moves[figure_to_move]:
            print("The figure ", figure_to_move, move[0], " can't move to", move[1])
            continue
        break
    figure_index = None
    if (figure_to_move.get_kind() == PAWN_FIGURE
        and to_move[0] == initianal_king_pos[board.get_opponent_player().get_color()][0]):
        figure_index = int(input("choose figure to be promoted in by typing a number: 1 - Queen, 2 - Rook, 3 - Bishop, 4 - Knight"))
        assert 5 > figure_index > 0
    return (figure_to_move, to_move, figure_index)

strategies = {"random":random_strategy, "simple eater":eater_strategy}

def game():
    player1 = Player(WHITE_FIGURE_COLOR, COMPUTER_PLAYER, random_strategy)
    player2 = Player(BLACK_FIGURE_COLOR, COMPUTER_PLAYER, random_strategy)                            
    ex = ChessBoard(player1, player2)
    game_recursive(player1, player2, ex)

def handle_move(chosen_move):
    if chosen_move == "resign":
        pass
    if chosen_move == "request_for_draw":
        pass
    figure_to_move, to_move, promotion_figure_index = chosen_move
    move_from = figure_to_move.get_pos()
    en_passant_square = games[session['id']].get_en_passant()
    games[session['id']].make_move(figure_to_move, (to_move[0], to_move[1]))
    games[session['id']].count_turn()
    promotion = False
    promoted_figure = None
    castling = False
    en_passant = False
    if (figure_to_move.get_kind() == PAWN_FIGURE
        and to_move[0] == initianal_king_pos[games[session['id']].get_current_player().get_color()][0]):
        games[session['id']].promote_pawn((to_move[0], to_move[1]), promotion_figure_index)
        promotion = True
        promoted_figure = games[session['id']].get_board_square(to_move[0], to_move[1])
    if (figure_to_move.get_kind() == PAWN_FIGURE
        and to_move == en_passant_square):
        en_passant = True
    if figure_to_move.get_kind() == KING_FIGURE and (abs(to_move[1] - move_from[1])) == 2:
        castling = True
    games[session['id']].dismiss_check()
    games[session['id']].set_if_check()
    games[session['id']].set_if_mate_stalemate()
    request_for_draw_50_moves = False
    if not games[session['id']].is_mate() and not games[session['id']].is_draw():
        if games[session['id']].is_dead_position():
            games[session['id']].set_draw_due_to_dead_position()
        elif games[session['id']].get_moves_without_pawn_move_or_eaten() >= 75:
            games[session['id']].set_draw_by_75_moves()
        elif games[session['id']].get_moves_without_pawn_move_or_eaten() >= 50:
            request_for_draw_50_moves = True           
    move_JSON = {"approved":True,
                 "choosePromotedFigure":False, 
                 "moveFrom": move_from, 
                 "moveTo": to_move,
                 "promotion": promotion,
                 "castling": castling,
                 "enPassant": en_passant,
                 "mate": games[session['id']].is_mate(),
                 "draw": games[session['id']].is_draw(),
                 "request_for_draw_50_moves": request_for_draw_50_moves
                 }
    if promotion:
        move_JSON["promotedFigure"] = promoted_figure.tranlslate_to_JSON()
    if games[session['id']].is_draw():
        move_JSON["drawReason"] = games[session['id']].get_draw_reason()
    return jsonify(move_JSON)


@app.route('/', methods = ["GET","POST"])
def index():
    return render_template("chess.html", computer_players = strategies.keys())

@app.route('/start_game', methods = ["POST"])
def start_game():
    random_uuid = uuid.uuid4()
    session['id'] = random_uuid
    type_of_game = request.form["typeOfGame"]
    chosen_color = request.form["color"]
    if chosen_color == "random":
        color = random.randrange(0, 2)
    elif chosen_color == "white":
        color = 0
    elif chosen_color == "black":
        color = 1
    #get the other color 
    opponent_color = (color + 1) % 2
    #creating players
    if type_of_game == "CPUVSCPU":
        computer1_strategy = strategies[request.form["CPU1"]]
        computer2_strategy = strategies[request.form["CPU2"]]
        player1 = Player(color, COMPUTER_PLAYER, computer1_strategy)
        player2 = Player(opponent_color, COMPUTER_PLAYER, computer2_strategy)
    elif type_of_game == "userVSCPU":
        player1 = Player(color, HUMAN_PLAYER)
        computer1_strategy = strategies[request.form["CPU1"]]
        player2 = Player(opponent_color, COMPUTER_PLAYER, computer1_strategy)   
    elif type_of_game == "HotSeat":
        player1 = Player(WHITE_FIGURE_COLOR, HUMAN_PLAYER)
        player2 = Player(BLACK_FIGURE_COLOR, HUMAN_PLAYER)
    if player1.get_color() == WHITE_FIGURE_COLOR:
        games[session['id']] = ChessBoard(player1, player2)
    else:
        games[session['id']] = ChessBoard(player2, player1)
    chessboard_figures_JSON = games[session['id']].translate_board_figures_to_JSON()
    player1JSON = player1.translate_to_JSON();
    player2JSON = player2.translate_to_JSON();
    game_JSON = {"players": [player1JSON, player2JSON],
                  "board": chessboard_figures_JSON}
    return jsonify(game_JSON)
  
@app.route('/cpu_move', methods = ["GET"])
def cpu_move():
    color = games[session['id']].get_current_player().get_color()
    moves = games[session['id']].get_possible_moves(color)
    legal_moves = clean_empty_sets_from_dict(games[session['id']].get_possible_legal_moves(moves, color))
    chosen_move = games[session['id']].get_current_player().implement_strategy(games[session['id']], legal_moves)
    return handle_move(chosen_move)

@app.route('/player_move', methods = ["POST"])
def player_move():
    from_move = (int(request.form["fromRow"]), int(request.form["fromCol"]))
    to_move = (int(request.form["toRow"]), int(request.form["toCol"]))
    color = games[session['id']].get_current_player().get_color()
    moves = games[session['id']].get_possible_moves(color)
    legal_moves = clean_empty_sets_from_dict(games[session['id']].get_possible_legal_moves(moves, color))
    figure_to_move = games[session['id']].get_board_square(from_move[0], from_move[1])
    message = ""
    if figure_to_move not in legal_moves:
        message = "The figure " + str(figure_to_move) + " " + str(from_move) + " position of which you entered has no legal moves"
    elif to_move not in legal_moves[figure_to_move]:
        message = "The figure " + str(figure_to_move) + " " + str(from_move) + " can't move to " + str(to_move)
    if message:
        move_JSON = {"approved":False, "message":message}
        return jsonify(move_JSON)
    elif (figure_to_move.get_kind() == PAWN_FIGURE
        and to_move[0] == initianal_king_pos[games[session['id']].get_opponent_player().get_color()][0]
        and games[session['id']].get_current_player().get_type_of_player() == HUMAN_PLAYER):
        choose_promoted_figure_JSON = {"approved":True, "choosePromotedFigure":True, "moveFrom": from_move, "moveTo":to_move}
        return jsonify(choose_promoted_figure_JSON)
    else:
        chosen_move = (figure_to_move, to_move, None)
    return handle_move(chosen_move)

@app.route('/register_promotion', methods = ["POST"])
def register_promotion():
    from_move = (int(request.form["fromRow"]), int(request.form["fromCol"]))
    to_move = (int(request.form["toRow"]), int(request.form["toCol"]))
    figure_to_move = games[session['id']].get_board_square(from_move[0], from_move[1])
    chosen_move = (figure_to_move, to_move, int(request.form["chosenFigureIndex"]))
    return handle_move(chosen_move)

@app.route('/accept_draw_50_moves', methods = ["GET"])
def accept_draw_50_moves():
    if (games[session['id']].get_moves_without_pawn_move_or_eaten() >= 50
     and games[session['id']].get_current_player().get_type_of_player() == HUMAN_PLAYER):
        games[session['id']].set_draw_by_50_moves()
        json_response = {"approved":True, "drawReason":games[session['id']].get_draw_reason()}
    else:
        json_response = {"approved":False}
    return jsonify(json_response)

@app.route('/resign', methods = ["GET"])
def resign():
    if games[session['id']].get_current_player().get_type_of_player() == HUMAN_PLAYER:
        games[session['id']].set_resign()
        json_response = {"approved":True}
    else:
        json_response = {"approved":False} 
    return jsonify(json_response)

