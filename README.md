monkey on a planar grid
===================

* There is a monkey which can walk around on a planar grid. 
* The monkey can move one space at a time left, right, up or down. 
    * That is, from (x, y) the monkey can go to (x+1, y), (x-1, y), (x, y+1), and (x, y-1). 
* Points where the sum of the digits of the absolute value of the x coordinate,
    plus the sum of the digits of the absolute value of the y coordinate 
    are lesser than or equal to 19 are accessible to the monkey. 
    * For example, the point (59, 79) is inaccessible because 5 + 9 + 7 + 9 = 30, which is greater than 19. 
    * Another example: the point (-5, -7) is accessible because abs(-5) + abs(-7) = 5 + 7 = 12, which is less than 19. 
* How many points can the monkey access if it starts at (0, 0), including (0, 0) itself?

The UI for this example was inspired by the [Conrad's Game of Life solution by Carl Fredrik Abelson](http://projects.abelson.info/life/)

