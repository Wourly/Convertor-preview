//this file is for demonstration purposes
//Convertor.tsx only uses copyToClipboard

// AJAX
//--------------------------------------------------------------
export function postRequest (handler:Function, data?:FormData, errorHandler?:Function):void {

    const request:XMLHttpRequest = new XMLHttpRequest();
  
    const loadListener = function (response:ProgressEvent) {
  
      const target = response.target as XMLHttpRequest;
      handler(target.responseText);
  
    };

    const errorListener = function (response:ProgressEvent) {

        if (errorHandler)
            errorHandler(response)
        else
            console.error(response)
    }
  
    request.addEventListener('load', loadListener);
    request.addEventListener('error', errorListener);
    request.open('POST', 'http://localhost:8080/questorServer/', true);
  
    if (!data)
      request.send();
    else
      request.send(data);
}

//==============================================================
// ARRAY
//==============================================================

// sorting
//--------------------------------------------------------------
export const sort = {

    alpha: <T, K extends keyof T> (array:Array<T>, property:K):void => {
        array.sort((a:T, b:T) => {

            return a[property] < b[property] ? -1 : 1
        })
    },

    antialpha: <T, K extends keyof T> (array:Array<T>, property:K):void => {
        array.sort((a:T, b:T) => {

            return a[property] > b[property] ? -1 : 1
        })
    }
};

// shuffle
//--------------------------------------------------------------
export function shuffleArray<T>(array:Array<T>) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// contains
//--------------------------------------------------------------
export function isValueInArray<T> (value:T, array:Array<T>):boolean {

    let checkFound = false;

    for (let index = 0; index < array.length; index++)
    {
        const arrayElement = array[index];

        if (arrayElement === value)
        {
            checkFound = true;
            break;
        }
    }

    return checkFound;
}

//==============================================================
// MISCELLANEOUS
//==============================================================
export function copyToClipboard (string:string):void {

    const textarea = document.createElement('textarea');
    textarea.value = string;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy'); //already considered obsolete, but clipboard event has terrible support
    document.body.removeChild(textarea);

}

export function generateUniqueIdentificator (identificatorsArray:Array<string>):string
{
    let candidate:string = '';

    while (true) {
        candidate = String(Math.floor(Math.random() * 100000))

        if (!identificatorsArray.includes(candidate))
            break;
    }

    return candidate;
}

export function isObjectEmpty (object:Object):boolean {

    const keyLength = Object.keys(object).length;

    return keyLength ? false : true;
}