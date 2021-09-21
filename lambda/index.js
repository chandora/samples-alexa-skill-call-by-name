"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
/**
 *
 */
const Alexa = __importStar(require("ask-sdk-core"));
const SkillTitle = 'ドリンクメーカー';
const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        console.log('>> LaunchRequestHandler ...');
        const speechText = '何をお飲みになりますか?';
        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .withSimpleCard(SkillTitle, speechText)
            .getResponse();
    }
};
const ShowMenuIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'ShowMenuIntent';
    },
    handle(handlerInput) {
        console.log('>> ShowMenuIntentHandler ...');
        const speechText = 'コーヒー、紅茶、日本茶がご用意できます。どれをお飲みになりますか ? ';
        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .withSimpleCard(SkillTitle, speechText)
            .getResponse();
    }
};
const OrderDrinkIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'OrderDrinkIntent'
            && Alexa.getDialogState(handlerInput.requestEnvelope) === 'COMPLETED';
    },
    handle(handlerInput) {
        console.log('>> OrderDrinkIntentHandler ...');
        const drink = Alexa.getSlotValue(handlerInput.requestEnvelope, 'Drink');
        const speechText = `${drink}ですね。承知しました。`;
        return handlerInput.responseBuilder
            .speak(speechText)
            .withSimpleCard(SkillTitle, speechText)
            .withShouldEndSession(true)
            .getResponse();
    }
};
const ResponseInterceptor = {
    process(handlerInput, response) {
        var _a;
        console.log('>> ResponseIntercepter ...');
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        if (Alexa.isNewSession(handlerInput.requestEnvelope)) {
            const personId = (_a = handlerInput.requestEnvelope.context.System.person) === null || _a === void 0 ? void 0 : _a.personId;
            switch (Alexa.getRequestType(handlerInput.requestEnvelope)) {
                case 'LaunchRequest':
                case 'IntentRequest':
                    embedPersonName(response, personId);
                    break;
                default:
            }
        }
    }
};
function embedPersonName(response, personId) {
    let outputSpeech = response === null || response === void 0 ? void 0 : response.outputSpeech;
    if (isSsmlText(outputSpeech)) {
        console.log('>> Adding person name');
        let text = outputSpeech.ssml;
        text = text.replace('<speak>', '').replace('</speak>', '');
        text = `<speak>${getPersonName(personId)}、${text}</speak>`;
        outputSpeech.ssml = text;
        if (response) {
            response.outputSpeech = outputSpeech;
        }
    }
}
function isSsmlText(outputSpeech) {
    return outputSpeech != null &&
        typeof outputSpeech === 'object' &&
        typeof outputSpeech.ssml === 'string';
}
function getPersonName(personId) {
    if (personId) {
        return `<alexa:name type="first" personId="${personId}"/>さん`;
    }
    return '';
}
const DialogDelegateHandler = {
    canHandle(handlerInput) {
        let result = false;
        const envelope = handlerInput.requestEnvelope;
        if (Alexa.getRequestType(envelope) === 'IntentRequest') {
            const dialogState = Alexa.getDialogState(envelope);
            if (dialogState === 'STARTED' || dialogState === 'IN_PROGRESS') {
                result = true;
            }
        }
        return result;
    },
    handle(handlerInput) {
        console.log('>> DialogDelegate ...');
        const request = Alexa.getRequest(handlerInput.requestEnvelope);
        return handlerInput.responseBuilder
            .speak('')
            .addDelegateDirective(request.intent)
            .getResponse();
    }
};
const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return (Alexa.getRequestType(handlerInput.requestEnvelope) === 'AMAZON.StopIntent' ||
            Alexa.getRequestType(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent') &&
            Alexa.getDialogState(handlerInput.requestEnvelope) === 'COMPLETED';
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder
            .speak('終了します')
            .withShouldEndSession(true)
            .getResponse();
    }
};
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder
            .speak('終了します')
            .withShouldEndSession(true)
            .getResponse();
    }
};
const ErrorHandler = {
    canHandle(handlerInput, error) {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`処理されたエラー：${error.message}`);
        return handlerInput.responseBuilder
            .speak('すみません、内部でエラーが発生しました。')
            .withShouldEndSession(true)
            .getResponse();
    },
};
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(LaunchRequestHandler, ShowMenuIntentHandler, OrderDrinkIntentHandler, DialogDelegateHandler, CancelAndStopIntentHandler, SessionEndedRequestHandler)
    // .addRequestInterceptors(RequestInterceptor)
    .addResponseInterceptors(ResponseInterceptor)
    .addErrorHandlers(ErrorHandler)
    .lambda();
//# sourceMappingURL=index.js.map