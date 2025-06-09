### Repository with presentation files

# Convertor
Link to application is not currently available due to issues with hosting provider. If you would like to see previous application (without real-time test preview), check it [here](https://mmconvertorpromo.netlify.app/Convertor). You can just check [video](https://www.youtube.com/watch?v=PbSgLuRLlyA), which shows, how Convertor is used. 

Convertor is an app, that uses simple syntax to generate web quizzes quickly. With real-time preview and powerful parser (reading engine) it will immediately tell you, how your quiz looks. And if there is a typo? Don't worry, Convertor will show you, where it is and how to fix it!

Among many applications, Convertor is focused on students' purposes. Once students grasp Convertor's syntax, they can create their own quizzes, while they create their notes.

Not only repetition helps with memorizing, but asking correct questions is crucial to understand topics. Convertor encourages for both things without slowing you down.

## Questor

App, that uses Convertor's output and sends you on your learning journey.

[Quest: Physiology of human and animals](http://wourly.xf.cz/questor/?test=MB150P26B)

## Convertor syntax

Below is an overview of the syntax, although Convertor provides contextual validation and guidance directly in the interface.

There is a rule, however: each line of text has its own meaning.

You need to name your test, you need to create a question and you need to type answers. That's all!

#### Commands

These guys are basically headings for your quest and sets, how it is named and displayed.

##### There are yet 3 commands:

+ \<questName> And here comes name of your quest.
+ \<questCode> This is needed as an identifier of your quest.
+ \<shuffleAnswers> any value, but it is recommended to type <true> for clarity

ShuffleAnswers is not previewable (works in Questor only)

#### Questions

Every question must have unique identificator, which then allows you to copy wrongly answered questions or allows you to save some harder questions for later repetition.

+ (_IDENTIFICATOR_OF_YOUR_OWN_CHOICE_) What would you like to ask?

#### Answers

There are currently two types of answers. One is simply yes or no answer, the other requires characters as your input.

+ T Correct answer
+ X Wrong answer
+ :name_placeholder Your text answer

When using text answer, each _ is substituted by space.

#### Other elements

Each question can have tags, these things associate similar questions, so if your quest is a long journey, you may want to proceed with adequate pace.

+ \# Tag of your own.
+ \## Tag group, which can contain tags.

Each question and answer can be accompanied by a picture. You simply mention pictures URL and it is assigned to previous question or answer.

+ @ http://web.com/your_image.png

### Few notes for developers

Convertor is currently programmed in React with TypeScript, while Questor is still in Vanilla JS. Questor is currently being rewritten in TypeScript and will soon be tested on real sample quest.

This preview repository presents Convertor.tsx as a file with main app component, functions.tsx shares code for both Convertor and Questor and tokenizer.tsx, which is the beggining of parsing process.

Additional info: between Convertor.tsx and tokenizer.tsx there is parser, that generates all output for Convertor and "Convertion processor" module, that filters only some errors at one time (for readability) and presents simpler connection between parser and convertor. Parser is both quite complex for description and is very versatile, so I keep code for myself.

### 👨‍💻 Developer Notes

Convertor is written in **React + TypeScript**. The core logic relies on a tokenizer and parser that analyze structured text into a question model. A central reducer manages state, supporting real-time validation and transformation into JSON output.

Questor (the quiz player) is currently built in Vanilla JS and is being rewritten in TS to align with Convertor.

While the parser is robust and modular, its full source code is not included here — the focus is on showcasing input, output, and integration logic via the files:
- `Convertor.tsx` – main component with reducer & UI
- `functions.ts` – shared utilities
- `tokenizer.ts` – initial parsing logic
