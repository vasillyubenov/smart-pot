Prerequisites: 

1) Setting up board (currently working with ESP-WROOM-32 NodeMCU-32S)
	Website of espressif and guide how to setup your board:
	https://docs.espressif.com/projects/esp-idf/en/v4.1/get-started/index.html#get-started-get-prerequisites

	Can check pinout here: 
	https://www.instructables.com/ESP32-Internal-Details-and-Pinout/
	
2) Documentation for esp32 setup for Espruino software: 
	https://www.espruino.com/ESP32
	
	
3) Kick start command for starting up flashing espruino on board (you need to be in folder where the files bootloader.bin, partitions_espruino.bin and espruino_esp32.bin, whether you built it with Cmake or downloaded it this files need to be present in the current directory for the command to work): 
	
esp-idf/components/esptool_py/esptool/esptool.py    \
--chip esp32                                \
--port /dev/ttyUSB0                         \
--baud 115200                               \
--after hard_reset write_flash              \
-z                                          \
--flash_mode dio                            \
--flash_freq 40m                            \
--flash_size detect                         \
0x1000 ~/Downloads/espruino/bootloader.bin                       \
0x8000 ~/Downloads/espruino/partitions_espruino.bin              \
0x10000 ~/Downloads/espruino/espruino_esp32.bin


3.1) Check if you dev port is /dev/ttyUSB0, migth as well be /dev/ttyACM0, or different if you are on a different OS, should have explicit instructions in setup in Espruino docs

4) After you flashed the Espruino software you can flash a file into memory with this command:
	
	sudo espruino -p /dev/ttyUSB0 -b 115200 --board ESP32 -m /path/to/file.js -v
	
4.1) Might have to change dev port if yours is different (like in 3.1)
	-v is not necessary (it should only print verbose by docs) found out the sometimes when flashing for first time to actually flash the file -v has to be present
	
4.2) Have to set permission mode on the dev port to be 666 read/write/execute to be able to flash on it 
