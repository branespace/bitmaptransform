# bitmaptransform

This program can be called via
```node index.js <original.bmp> <newfile.bmp> <transformation>```

Author: Greg Irwin
Collaborators: Steven Chadwick and Kasim Siddiqui

# Transformations
Several different transformations are possible:
Grayscale, sepia, invert colors, flip horizontally, flip vertically blue channel, red channel, and green channel.

A transformation can be called as an option in a couple of different ways
```grayscale``` or ```-gray```
```sepia``` or ```-s```
```invert``` or ```-i```
```vertical``` or ```-v```
```horizontal``` or ```-h```
```blue``` or ```-b```
```red``` or ```-r```
```green``` or ```-g```


The help command is available:
```node index.js --help```

Get a list of available transformations:
```node index.js --list```
