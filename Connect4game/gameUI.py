import pygame
import os
import sys
pygame.init()


rows = 9
cols = 10
square_size = 60
coin_size = square_size // 2 - 10



height = 800
width = 800
offset_x = (width - cols * square_size) // 2
offset_y = (height - rows * square_size) // 2

screen = pygame.display.set_mode((width, height))
pygame.display.set_caption("Game UI Example")


running = True
grid = [[0 for _ in range(cols)] for _ in range(rows)]
players = [
    {"id":1,"name": "Player 1", "color": (224, 0, 0)},
    {"id":2,"name": "Player 2", "color": (0, 0, 224)},
    {"id":3,"name": "Player 3", "color": (0, 224, 0)},
    {"id":4,"name": "Player 4", "color": (224, 224, 0)}
]

def update():
    pygame.display.flip()  # Update the display

def main_menu():
    menu_running = True
    selected_players = 0  # Variable to track selected players
    
    title_font = pygame.font.Font(os.path.join('./assets/fonts/PixelifySans-VariableFont_wght.ttf'), 36)  # Font for menu text
    font = pygame.font.Font(os.path.join('./assets/fonts/PixelifySans-VariableFont_wght.ttf'), 24)  # Font for menu buttons
    title_text = title_font.render("Connect Four", True, (224, 224, 224))

    button_data = []
    for i in range(2, 5):
        text = font.render(f"{i} Players", True, (224, 224, 224))
        button_rect = text.get_rect(center=(width // 2, height // 2 + (i - 2) * 50 ))
        button_data.append((text, button_rect))

    while menu_running:
        screen.fill(('pink'))  # Fill the screen with black color
        screen.blit(title_text, (width // 2 - title_text.get_width() // 2, height // 4))

        for i,(text, rect) in enumerate(button_data):
            pygame.draw.rect(screen, (0, 0, 224), (rect.x -20 ,rect.y-5, text.get_width()+40,text.get_height()+10 ), border_radius=10)  # Draw button background
            screen.blit(text, ((rect.x + (rect.width - text.get_width())//2 ), rect.y + (rect.height - text.get_height()) // 2))  # Draw button text

        # Draw buttons
        exit_text = font.render("Exit", True, (224, 224, 224))
        exit_rect = exit_text.get_rect(center=(width // 2, height // 2 + 150))
        pygame.draw.rect(screen,(200,0,0), (exit_rect.x -20 ,exit_rect.y-5, exit_text.get_width()+40,exit_text.get_height()+10 ), border_radius=10)  # Draw exit button background
        screen.blit(exit_text, (exit_rect.x + (exit_rect.width - exit_text.get_width()) // 2, exit_rect.y + (exit_rect.height - exit_text.get_height()) // 2))  # Draw exit button text

        update() # Update the display

        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                menu_running = False
                pygame.quit()
                sys.exit()

            if event.type == pygame.MOUSEBUTTONDOWN:
                if event.button == 1:
                    for i, (text, rect) in enumerate(button_data):
                        if rect.collidepoint(event.pos):
                            selected_players = i+2
                            print(f"Selected {selected_players} players")
                            menu_running = False

            if event.type == pygame.MOUSEBUTTONDOWN:
                if event.button == 1:
                    if exit_rect.collidepoint(event.pos):
                        menu_running=False
                        pygame.quit()
                        sys.exit()
    return selected_players  # Return the number of players selected



def draw_board():
    screen.fill('pink')  # Fill the screen with black color
    board_bg_color = ('red')
    pygame.draw.circle(screen,board_bg_color,(offset_x+(2*square_size),offset_y-25),70)
    pygame.draw.circle(screen,board_bg_color,(offset_x+(8*square_size),offset_y-25),70)
    pygame.draw.circle(screen,('white'),(offset_x+(2*square_size),offset_y-25),55)
    pygame.draw.circle(screen,('white'),(offset_x+(8*square_size),offset_y-25),55)
    pygame.draw.circle(screen,('black'),(offset_x+(2*square_size),offset_y-25),30)
    pygame.draw.circle(screen,('black'),(offset_x+(8*square_size),offset_y-25),30)
    boardframe = pygame.Rect(offset_x -25,offset_y-25,(cols*square_size)+50,(rows*square_size)+50)
    pygame.draw.rect(screen,board_bg_color,boardframe,0,15)

    for c in range(cols):
        for r in range(rows):

                # Draw a coin in the corner squares
            board_color = (64,224,208) # Cyan color for the board squares
            rect = pygame.Rect(c * square_size + offset_x, r * square_size + offset_y, square_size, square_size)
            circle_center = (rect.centerx, rect.centery)

            if (c == 0 and r == 0):
                pygame.draw.rect(screen, board_color,rect,0,border_top_left_radius=25)  # Rounded corners
            elif (c == cols-1 and r == 0):
                pygame.draw.rect(screen, board_color, rect,0,border_top_right_radius=25)  # Rounded corners
            elif (c == 0 and r == rows-1):
                pygame.draw.rect(screen, board_color, rect,0,border_bottom_left_radius=25)  # Rounded corners
            elif (c == cols-1 and r == rows-1):
                pygame.draw.rect(screen, board_color, rect,0,border_bottom_right_radius=25)  # Rounded corners
            else:
                pygame.draw.rect(screen, board_color, rect)
            # Draw a circle in the center of the square
            # if grid[r][c] == player_id:
            #     pygame.draw.circle(screen, player_color, circle_center, coin_size)
            # else:
            #     pygame.draw.circle(screen,(0,0,0), circle_center, coin_size)
            cell_value = grid[r][c]
            if cell_value == 0:
                pygame.draw.circle(screen, (0, 0, 0), circle_center, coin_size)
            else:
                color = next((p["color"] for p in playerlist if p["id"] == cell_value), (224, 224, 224))
                pygame.draw.circle(screen, color, circle_center, coin_size)


def get_col_from_mouse_pos(mouse_pos):
    x,_= mouse_pos
    col = (x-offset_x) // square_size + 1
    return col

def find_coin_location(col,player):
    if grid[1][col] != 0:
        print("Column is full")
        return None  # Column is full, cannot place a coin
    # Draw a coin in the specified column
    for r in range(rows):
        if r < rows - 1 and grid[r+1][col] == 0:
            # Temporary visual drop
            draw_board()
            center = (offset_x + col * square_size + square_size // 2, offset_y + r * square_size + square_size // 2)
            pygame.draw.circle(screen, player_color, center, coin_size)
            update()
            pygame.time.wait(50)  # Wait for 50ms
        else:
            grid[r][col] = player
            break # Return the row and column where the coin is placed

def winning_condition(player):
    #horizontal check
    for r in range(rows):
        for c in range(cols - 3):
            if all(grid[r][c+i] == player for i in range(4)):
                return True
    #vertical check
    for c in range(cols):
        for r in range(rows - 3):
            if all(grid[r+i][c] == player for i in range(4)):
                return True
    #diagonal right check
    for r in range(rows - 3):
        for c in range(cols - 3):
            if all(grid[r+i][c+i] == player for i in range(4)):
                return True
    #diagonal left check
    for r in range(rows - 3):
        for c in range(3, cols):
            if all(grid[r+i][c-i] == player for i in range(4)):
                return True
    return False  # No winning condition met


no_players = main_menu() 
update()
pygame.time.wait(200)
playerlist = players[:no_players]
current_player_index = 0  # Get the selected number of players

while running:
    player = playerlist[current_player_index]
    player_id = player["id"]
    player_color = player["color"]
    player_name = player["name"]

    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False

        if event.type == pygame.MOUSEBUTTONDOWN:
            if event.button == 1:  # Left mouse button
                mouse_pos = pygame.mouse.get_pos()
                # print(mouse_pos) # Print mouse position for debugging
                # Check if the mouse position is within the board area
                # print(width- (cols * square_size+offset_x)) #starting point of the board x
                # print((offset_x + cols * square_size)) # ending point of the board x
                # print(height- (rows * square_size + offset_y)) #starting point of the board y
                # print((offset_y + rows * square_size)) # ending point of the board y

                if(mouse_pos[0] >= width- (cols * square_size+offset_x) and mouse_pos[0] <= (offset_x + cols * square_size) and
                   mouse_pos[1] >= height- (rows * square_size + offset_y) and mouse_pos[1] <= (offset_y + rows * square_size)):
                    # If the mouse is within the board area, get the column clicked
                    col= get_col_from_mouse_pos(mouse_pos)
                    find_coin_location(col-1, player_id) # Adjust column index for 0-based indexing
                    # change player turn
                    # Draw a coin in the clicked column
                    # print(f"Column clicked: {col}") # Print the column clicked
                    if winning_condition(player_id):
                        print(f"{player_name} win!")
                        running = False

                    if all(grid[r][c] != 0 for r in range(rows) for c in range(cols)):
                        print("It's a draw!")
                        running = False
                    if no_players>1:
                        current_player_index = (current_player_index + 1) % no_players
                    else:
                        current_player_index = 0



    draw_board()  # Draw the game board
    # Draw a simple rectangle as a placeholder for game UI
    #pyame.draw.rect(screen,color, rect)
    # pygame.draw.rect(screen, (224, 0, 0), (100, 100, 200, 100))
    #draw a circle use pygame.draw.circle(screen, color, center, radius)
    # pygame.draw.circle(screen, (0, 224, 0), (400, 300), 50)  # Draw a circle

    update()  # Update the display

pygame.quit()
sys.exit()