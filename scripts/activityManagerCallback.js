const getIds = () => {
    window.parent.postMessage({
        application: "activity-manager",
        message: "init"
    }, '*');
}

window.addEventListener("message", event => {
    if (event.data.application !== "activity-manager") {
        return;
    }

    console.log(event.data.message);
    console.log(event.data);

    switch(event.data.message) {
        case 'init-response':
            const { data } = event.data;
            userId = data.studentId;
            otherId = data.collaboratorId;
        break;
    }
});

window.parent.postMessage({
    application: 'activity-manager',
    message: 'set-iframe-height',
    data: { iframeHeight: 650 }
}, '*');

const setAnswers = (outcome) => {
    window.parent.postMessage({
        application: 'activity-manager',
        message: 'set-answers',
        data: { answers: [outcome] }
    }, '*');
}

const examine = (status) => {
    window.parent.postMessage({
        application: 'activity-manager',
        message: 'auto-examine',
        data: { status: status }
    }, '*');
}