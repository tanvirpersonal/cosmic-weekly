When people say a machine "learned" something, they usually mean something much more concrete than the word suggests: a very large set of numbers was adjusted until a system got better at a task.

## A guessing game with feedback

Imagine a system that tries to label photos as *cat* or *not cat*. At the start its internal numbers, called **parameters**, are random, so its answers are random too. Training repeats a simple loop:

1. Show the system an example.
2. Let it make a guess.
3. Measure how wrong the guess was. That measurement is called the **loss**.
4. Nudge every parameter slightly in the direction that would have reduced the loss.

Repeat that millions of times and the numbers settle into a pattern that works.

## Why it is called a network

Modern systems stack many small mathematical units into layers, loosely inspired by neurons. Early layers pick up simple features such as edges. Later layers combine them into richer ones. Nobody writes these features by hand; they emerge from the data.

> The system does not understand cats. It has found a reliable statistical shortcut for telling cats apart from everything else it has seen.

## Where it goes wrong

- **Biased data** produces biased results. The model can only reflect what it was shown.
- **Overfitting** happens when a model memorises its examples instead of learning the general pattern.
- **Confident mistakes** are common. A fluent answer is not the same thing as a correct one.

## The useful mindset

Machine learning is best seen as a powerful tool for finding patterns, not a mind. It is strongest when we can check its output, and weakest when we cannot.
