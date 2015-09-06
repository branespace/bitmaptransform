# bitmaptransform

This program can be called via
```node index.js <original.bmp> <newfile.bmp> <transformation>```

Author: Greg Irwin
Collaborators: Steven Chadwick and Kasim Siddiqui

# Transformations
Several different transformations are possible:
Grayscale, invert image, blue channel, red channel, and green channel.

A transformation can be called as an option in a couple of different ways
```grayscale``` or ```-gray```
```invert``` or ```-invert```
```blue``` or ```-b```
```red``` or ```-r```
```green``` or ```-g```


The help command is available:
```node index.js --help```

Get a list of available transformations:
```node index.js --list```
