# AddReaction
A BetterDiscord plugin that essentially adds commands that you can type in the chat box to quickly react to existing reactions.

## How to use
Similar to how you'd normally use bot commands, simply type the command in the chat box and press enter. If you want to skip a command, put a backslash(\\) just before it without any spaces.

## Commands
> Anything inside square brackets is optional

#### ```+[index: number]```
Adds your reaction to the last message that contains a reaction or reactions. It only checks the last 10 messages and if there aren't any reactions, it does nothing. You can use ```index``` to specify which reaction to react to in the message. If index isn't provided, it reacts to the first reaction.

#### ```++[index: number]```
Stricter version of ```+```. It only checks the last message and if there aren't any reactions, it does nothing.

## Examples
```+```, ```+1```, ```++12```

PS: Could prove to be useful for Mudae :)
