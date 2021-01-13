import React, { useEffect, useReducer } from 'react';

import { Header } from '../shared components/core/header';
import { BlankMain } from '../shared components/core/main';
import { Footer } from '../shared components/core/footer';

import { Button } from '../shared components/common/button'
import { Checker } from '../shared components/common/checker'

import { ConversionProcessor } from '../library/convertor/conversionProcessor';
import { copyToClipboard } from '../library/shared/functions';

import { ErrorTokenReport, ErrorReport } from '../library/convertor/errorHandling';

import { renderErrors } from './renderErrors';
import { QuestPreview } from './QuestPreviewComponent';

import { ConvertorOutput, Question, AnswerEvaluationDataType } from '../library/shared/shapes'

import { isAnswerBooleanCorrect } from '../questor/quest components/answerBoolean';
import { isAnswerTextCorrect } from '../questor/quest components/answerText';

import './convertor.css';

//==============================================================
// STATE
//==============================================================

class ConvertorState {

    inputString:string = `<questName> Biology
<questCode> ...

(animal1) How would you label this animal?
@ https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/Honey_badger.jpg/260px-Honey_badger.jpg
# animals
:genus Mellivora
:specio Capensis`

    identificators:string[] = [];
    errorTokenReports:ErrorTokenReport[] = [];
    errorReports:ErrorReport[] = [];

    runtimeQuestions:Question[] = [];

    shouldConvertOnInput:boolean = true;
    isParsedCorrectly:boolean = false;
    shouldDisplayTags:boolean = false;

    convertorOutput = new ConvertorOutput();

};

//==============================================================
// REDUCER
//==============================================================
// actions
//--------------------------------------------------------------
const InstructionsArray = [
    'HANDLE_BUTTON_CONVERT_INPUT',
    'HANDLE_CHECKBOX_CONVERT_ON_INPUT',
    'HANDLE_CHECKBOX_DISPLAY_TAGS',
    'HANDLE_TEXTAREA_INPUT',
    'HANDLE_RUNTIME'
] as const;

// request type
//--------------------------------------------------------------
type ConvertorStateChangeRequestType = {
    instruction: typeof InstructionsArray[number]
    data?:undefined | string | AnswerEvaluationDataType;
}

// reducer function
//--------------------------------------------------------------
function convertorStateReducer (convertorState:ConvertorState, convertorStateChangeRequest:ConvertorStateChangeRequestType):ConvertorState {

    const {instruction, data} = convertorStateChangeRequest;

    let shouldUseConversion = false;

    const newState = {...convertorState} as ConvertorState;
    
    // instructions
    //--------------------------------------------------------------
    switch (instruction) {
        // if checkbox 'convert on input' is not active, convert manually with button
        case 'HANDLE_BUTTON_CONVERT_INPUT':

            shouldUseConversion = true;

        break;
        // checkbox 'convert on input'
        case 'HANDLE_CHECKBOX_CONVERT_ON_INPUT':

            if (!convertorState.shouldConvertOnInput)
                shouldUseConversion = true;

            newState.shouldConvertOnInput = !convertorState.shouldConvertOnInput;
        
        break;
        // checkbox 'display tags'
        case 'HANDLE_CHECKBOX_DISPLAY_TAGS':

            shouldUseConversion = true;

            newState.shouldDisplayTags = !newState.shouldDisplayTags;
            
        break;
        // typing into text area
        case 'HANDLE_TEXTAREA_INPUT':

            if (convertorState.shouldConvertOnInput) //does not have ! operator as condition above
                shouldUseConversion = true;
            
            newState.inputString = data as string;
        
        break;
        // this concerns actions of quest preview
        // answer clicking and checking
        case 'HANDLE_RUNTIME':

            if (data) {

                const answerEvaluationData = data as AnswerEvaluationDataType;

                if (answerEvaluationData.target === 'answer') {
                    const {questionIndex, answerIndex, newValue} = answerEvaluationData;

                    const question = newState.runtimeQuestions[questionIndex];

                    const {answersType} = question;
                    const answer = question.answers[answerIndex];

                    switch (answersType) {
                        case 'boolean':
                            
                            answer.userInput = !answer.userInput;
                            answer.isCorrect = isAnswerBooleanCorrect(answer);

                        break;
                        case 'text':

                            answer.userInput = newValue;
                            answer.isCorrect = isAnswerTextCorrect(answer);

                        break;
                    }
                }
            }
        
        break;
    }
    //--------------------------------------------------------------
    // instructions end
    
    // conversion processor output access
    //--------------------------------------------------------------
    if (shouldUseConversion)
    {   
        const convertedResources = new ConversionProcessor(newState.inputString);

        newState.errorTokenReports = convertedResources.errorTokenReports;
        newState.errorReports = convertedResources.errorReports;
        newState.isParsedCorrectly = convertedResources.isParsedCorrectly;
        newState.identificators = convertedResources.identificators;
        newState.runtimeQuestions = convertedResources.questions.slice(-10);

        newState.convertorOutput.questSettings = convertedResources.questSettings;
        newState.convertorOutput.questions = convertedResources.questions;
        newState.convertorOutput.tags = convertedResources.tags;
        newState.convertorOutput.tagsGroups = convertedResources.tagsGroups;
    }
 
    return newState;

}
//--------------------------------------------------------------
// reducer function end

//==============================================================
// COMPONENT
//==============================================================

export function Convertor () {

    const [convertorState, setConvertorState] = useReducer(convertorStateReducer, new ConvertorState());

    useEffect(() => {
        setConvertorState({instruction: 'HANDLE_BUTTON_CONVERT_INPUT'});
    }, []);

    // basic controls
    //--------------------------------------------------------------
    const convertButtonHandler = () => {
        setConvertorState({instruction: 'HANDLE_BUTTON_CONVERT_INPUT'})
    };

    const convertOnInputHandler = () => {
        setConvertorState({instruction:'HANDLE_CHECKBOX_CONVERT_ON_INPUT'})
    };

    const displayTagsHandler = () => {
        setConvertorState({instruction:'HANDLE_CHECKBOX_DISPLAY_TAGS'})
    }

    const textareaInputHandler = (event:React.ChangeEvent<HTMLTextAreaElement>) => {
        setConvertorState({instruction: 'HANDLE_TEXTAREA_INPUT', data:event.target.value as string});
    };

    const copyJSONhandler = () => {
        const finalizedJSON = JSON.stringify(convertorState.convertorOutput, null, 3)
        copyToClipboard(finalizedJSON);
    };
    //--------------------------------------------------------------
    // basic controls end

    // real-time quest simulation - used by quest preview component
    //--------------------------------------------------------------
    const stateReducerInvoker = (component:string, data:any) => {
        //component is used by 'real' Questor, not in Convertor
        setConvertorState({
            instruction:'HANDLE_RUNTIME',
            data:data
        })
    }
 
    //==============================================================
    // COMPONENT RETURN
    //==============================================================

    return <div className="Convertor">
                <Header title={'Convertor'}/>

                <BlankMain>
                    <textarea value={convertorState.inputString} onChange={textareaInputHandler}/>
                    <section className={"Output" + (convertorState.isParsedCorrectly ? ' parsed' : '')}>

                        {
                        convertorState.isParsedCorrectly ?
                            <QuestPreview convertorOutput={convertorState.convertorOutput} runtimeQuestions={convertorState.runtimeQuestions} shouldDisplayTags={convertorState.shouldDisplayTags} stateReducerInvoker={stateReducerInvoker}/>
                                :
                            renderErrors (convertorState.errorReports, convertorState.errorTokenReports, convertorState.identificators)
                        }
                        
                    </section>
                </BlankMain>

                <Footer>
                    <Checker extendClassList='Footer ConvertOnInput' checked={convertorState.shouldConvertOnInput} text='Convert on input' handler={convertOnInputHandler}/>
                    <Checker extendClassList='Footer DisplayTags' checked={convertorState.shouldDisplayTags} text='Display tags' handler={displayTagsHandler}/>
                    <Button extendClassList='Footer CopyJson' colorScheme="bright" handler={copyJSONhandler} isDisabled={!convertorState.isParsedCorrectly}>
                        Copy JSON
                    </Button>
                    <Button extendClassList='Footer Convert' colorScheme="bright" handler={convertButtonHandler} isDisabled={convertorState.shouldConvertOnInput}>
                        Convert
                    </Button>
                </Footer>
            </div>
    //==============================================================
    // COMPONENT RETURN END
    //==============================================================
};


