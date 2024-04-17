import pyautogui
import time
from pynput.mouse import Listener, Button
from pynput.keyboard import Listener as ListenerK


def on_click(x, y, button: Button, pressed):
    if pressed:  # Check if the button was pressed (not released)
        print(f"@ ({x:.2f}, {y:.2f}) {button.name} ")

# Add listener for mouse clicks
with Listener(on_click=on_click) as listener:
    listener.join()

with ListenerK(on_press=print) as listener:
    listener.join()


print("Listening for clicks. Press Ctrl-C to stop.")

# Keep the program running to listen for clicks 
try:
    while True:
        time.sleep(0.1)  # Small delay to not overload the CPU
except KeyboardInterrupt:
    print("Exiting...")
