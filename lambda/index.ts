/**
 * 
 */
import * as Alexa from 'ask-sdk-core';
import * as Model from 'ask-sdk-model';

const SkillTitle = 'ドリンクメーカー';

const LaunchRequestHandler: Alexa.RequestHandler = {
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

const ShowMenuIntentHandler: Alexa.RequestHandler = {
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
}

const OrderDrinkIntentHandler: Alexa.RequestHandler = {
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
}

const ResponseInterceptor: Alexa.ResponseInterceptor = {
    process(handlerInput, response) {
        console.log('>> ResponseIntercepter ...')
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        if (Alexa.isNewSession(handlerInput.requestEnvelope)) {
            const personId =
                handlerInput.requestEnvelope.context.System.person?.personId;
            switch (Alexa.getRequestType(handlerInput.requestEnvelope)) {
                case 'LaunchRequest':
                case 'IntentRequest':
                    embedPersonName(response, personId);
                    break;
                default:
            }
        }
    }
}

function embedPersonName(response: Model.Response | undefined, personId: string | undefined): void {
    if (response && isSsmlText(response.outputSpeech)) {
        console.log('>> Adding person name');
        let text = response.outputSpeech.ssml;
        text = text.replace('<speak>', '').replace('</speak>', '');
        text = `<speak>${getPersonName(personId)}、${text}</speak>`;

        response.outputSpeech.ssml = text;
    }
}

function isSsmlText(outputSpeech: any): outputSpeech is Model.ui.SsmlOutputSpeech {
    return outputSpeech != null &&
        typeof outputSpeech === 'object' &&
        typeof outputSpeech.ssml === 'string';
}

function getPersonName(personId: string | undefined) {
    if (personId) {
        return `<alexa:name type="first" personId="${personId}"/>さん`;
    }

    return '';
}

const DialogDelegateHandler: Alexa.RequestHandler = {
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
        console.log('>> DialogDelegate ...')
        const request = Alexa.getRequest<Model.IntentRequest>(handlerInput.requestEnvelope);

        return handlerInput.responseBuilder
            .speak('')
            .addDelegateDirective(request.intent)
            .getResponse();
    }
}

const CancelAndStopIntentHandler: Alexa.RequestHandler = {
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
}

const SessionEndedRequestHandler: Alexa.RequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder
            .speak('終了します')
            .withShouldEndSession(true)
            .getResponse();
    }
}

const ErrorHandler: Alexa.ErrorHandler = {
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

export const handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        ShowMenuIntentHandler,
        OrderDrinkIntentHandler,
        DialogDelegateHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler,
    )
    // .addRequestInterceptors(RequestInterceptor)
    .addResponseInterceptors(ResponseInterceptor)
    .addErrorHandlers(ErrorHandler)
    .lambda();
