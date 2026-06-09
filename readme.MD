# TFIS-pathfind
TFIS is a TUI app that ranks paths (file system) based on the Tsukamoto Fuzzy 
Inference System. It measures how well a path matches a given pattern.

The system measures:
1. Proportion of case similarity
2. Distance between characters in the target path string
3. Ratio of pattern length to path string length

To navigate between sections, use `hjkl`

- h : left
- j : down
- k : up
- l : right

To go inside of a section :

- ] : inside
- [ : outside

To toggle navigation (active/ inactive) :

- ]] : lock
- [[ : unclock

# Development

requirement :
 - node
 - npm
 - git


## Step

1. clone this repo  ```git clone [url]```
2. npm i
3. npm run dev (development mode)
