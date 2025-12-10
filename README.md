# Sliding-Puzzle-Solver
An algorithm for solving sliding puzzles

This project features an interactable sliding puzzle, a kind where there are shuffled tiles on a grid and an empty space into which you can slide other tiles.
<img width="566" height="652" alt="image" src="https://github.com/user-attachments/assets/f99b80b5-e961-486a-87c7-af72592e7722" />

The goal of this puzzle is to place the tiles in the correct order.

This project also features an algorithm that solves the sliding puzzle by making use of a maze-solving algorithm.
The puzzle is seen as a series of small mazes, where each of the tile is placed in the right position one-by-one, and the already placed tiles are treated as obstacles.
<img width="424" height="430" alt="image" src="https://github.com/user-attachments/assets/12a1de6a-d885-417c-864f-981db95ee4e4" />

This divide-and-conquer approach is not viable in its raw form, as there will be situations where the maze is impossible to solve, in this case the algorithm handles each of these exceptions separately

The algoritm is a work in progress
