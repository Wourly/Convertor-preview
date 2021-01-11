//==============================================================
// TOKENIZER
//==============================================================
// inputString -> stringLinesArray
// stringLinesArray -> TokenArray

export function tokenizer (inputString:string, textLineArrayReference:Array<string>, tokenArrayReference:Array<Token>):void {
    
   textLineArrayReference.push(
    ...inputString
    .split("\n"));

    //fastest
    const stringLinesArrayLength = textLineArrayReference.length;
    for (let index:number = 0; index < stringLinesArrayLength; index++) {
        
        const line:string = textLineArrayReference[index].trim();

        if (line.length && line[0] !== '/')
            tokenArrayReference.push(new Token(line, index))
    }

}

// TOKEN MEANINGS
//--------------------------------------------------------------
export enum TokenMeaning {

    no_meaning = 0,
    question,
    answer_boolean_correct,
    answer_boolean_wrong,
    answer_text,

    tag = 11,
    tag_group,

    image,
    
    hint_after,

    command = 100,

    error_unknown_token = 500,
    error_not_parsed_question_identificator,
    error_question_identificator_not_allowed_characters,
    error_not_parsed_text_answer,
    error_not_parsed_command,
    error_duplicate_question_identificator,

    error_question_no_answer,
    error_answer_before_question,
    error_answer_different_type,

    error_tag_position,
    error_tag_duplicate,
    error_tag_group_position,
    error_image_position,
    error_hint_after_position,

    error_label_HTML_tag_with_attribute,
    error_label_HTML_tag_script
}

export const AnswerTokenMeanings = [TokenMeaning.answer_boolean_correct, TokenMeaning.answer_boolean_wrong, TokenMeaning.answer_text];

//==============================================================
// TOKEN with its processing within constructor
//==============================================================
export interface Token {
    label:string
    identificator:string
    command:string
}

// CLASS
//--------------------------------------------------------------
export class Token {
    meaning:TokenMeaning = TokenMeaning.no_meaning;
    content:string = '';
    lineIndex:number

    // CONSTRUCTOR
    //--------------------------------------------------------------
    constructor(textLine:string, lineIndex:number) {

        this.lineIndex = lineIndex;

        // TOKEN MEANING ASSIGNMENT
        //--------------------------------------------------------------
        // regex: capture group 1: read everything until a space character  -> Token.meaning, Token.label, Token.identificator, Token.command
        // regex: space
        // regex: capture group 2: read everything until the end            -> Token.content
        //--------------------------------------------------------------
        textLine.replace(/^(\S+)\s(.+)$/m, (fullMatch:string, tokenMeaningMatch:string, contentMatch:string):string => {
    
                this.content = contentMatch;
                
                // SWITCH
                //--------------------------------------------------------------
                switch (tokenMeaningMatch[0]) {
                    
                    // ANSWER_BOOLEAN
                    //--------------------------------------------------------------
                    case 'T':
                        this.meaning = TokenMeaning.answer_boolean_correct;
                    break;
                    case 'X':
                        this.meaning = TokenMeaning.answer_boolean_wrong;
                    break;

                    // ANSWER_TEXT
                    //--------------------------------------------------------------
                    case ':':
                        if (!extractLabel(this, tokenMeaningMatch))
                            this.meaning = TokenMeaning.error_not_parsed_text_answer
                    break;
                    
                    // TAG
                    //--------------------------------------------------------------
                    case '#':
                        // #
                        if (tokenMeaningMatch === '#')
                            this.meaning = TokenMeaning.tag;
                        // ##
                        else if (tokenMeaningMatch === '##')
                            this.meaning = TokenMeaning.tag_group
                    break;

                    // IMAGE
                    //--------------------------------------------------------------
                    case '@':
                        this.meaning = TokenMeaning.image;
                    break;

                    // HINT
                    //--------------------------------------------------------------
                    case '$':
                        this.meaning = TokenMeaning.hint_after;
                    break;

                    // QUESTION + COMMANDS
                    //--------------------------------------------------------------
                    case '(':
                    case '<':
                    {
                        const openingBracket:string = tokenMeaningMatch[0];
                        this.meaning = bracketMeaning[openingBracket];
        
                        if (!extractBracketInnards(this, tokenMeaningMatch, openingBracket))
                            //extraction error
                            if (this.meaning === TokenMeaning.question)
                                this.meaning = TokenMeaning.error_not_parsed_question_identificator
                            else
                                this.meaning = TokenMeaning.error_not_parsed_command
                        
                    } break;
                }
                //--------------------------------------------------------------
                // SWITCH END
                return '';
            });

               
        if (this.meaning === TokenMeaning.no_meaning) {

            this.meaning = TokenMeaning.error_unknown_token
            this.content = textLine;
        }
        //--------------------------------------------------------------
        // TOKEN MEANING ASSIGNMENT END
        
        Object.freeze(this);
    }
    //--------------------------------------------------------------
    // CONSTRUCTOR END
}
//--------------------------------------------------------------
// CLASS END

//==============================================================
// HELPERS
//==============================================================

// brackets' assignment
//--------------------------------------------------------------
const secondBracket = {
    '(':')',
    '<':'>'
} as {
    [key:string]:string
}

const bracketMeaning = {
    '(':TokenMeaning.question,
    '<':TokenMeaning.command
} as {
    [key:string]:TokenMeaning
}

// extraction of label for text answers
//--------------------------------------------------------------
const textAnswerRegExp = new RegExp(/:([^\s]+)/, 'gm');

const extractLabel = (token:Token, meaningMatch:string) => {

    let wasValueExtracted = false;

    meaningMatch.replace(textAnswerRegExp, (fullMatch:any, labelMatch:string) => {

        wasValueExtracted = true;

        //replace '_' characters in label with space characters -> '_' character becomes user friendly
        const label = labelMatch.replace(/_/g, ' ');

        token.label = label;
        token.meaning = TokenMeaning.answer_text;

        return '';
    })

    return wasValueExtracted;
} 

// extraction of question identificator and commands
//--------------------------------------------------------------
function createDoubleBracketRegExpReader (bracket:string):RegExp {
    return new RegExp('\\' + bracket + '(.+)\\' + secondBracket[bracket]);
}

const extractBracketInnards = (token:Token, meaningMatch:string, openingBracket:string):boolean => {
    
    let wasValueExtracted = false;

    const readIdentificatorRegExp = createDoubleBracketRegExpReader(openingBracket);

    meaningMatch.replace(readIdentificatorRegExp, (fullMatch:any, brackerdInnards:string):string => {
            
        wasValueExtracted = true;

        if (token.meaning === TokenMeaning.question)
            token.identificator = brackerdInnards
        else
            token.command = brackerdInnards

        return '';
    });

    return wasValueExtracted
}