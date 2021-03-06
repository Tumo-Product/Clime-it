let userId = "2";
let otherId = "1";
let postsCreated = [];
let commentsCreated = [];

let skills = [];
let questionsToAnswer = [];
let instructions = {};

const minPostLength = 75, maxPostLength = 400;
const minCommentLength = 30, maxCommentLength = 200;

let commenting = false;
let postsToComment = [];
let questions;
let responses = [];

let ratings = {};

const onLoad = async () => {
    let name    = await network.getSetName();
    let data    = await network.getData();
    questions   = data.questions;
    skills      = name.split("_");

    for (const skill in questions) {
        filter.add(skill);
    }

    for (let i = 0; i < skills.length; i++) {
        let currQuestions = shuffle(questions[skills[i]]);
        questionsToAnswer.push(currQuestions[0]);
        if (otherId === undefined) break;
    }

    instructions = data.instructions;

    let user = await network.users.validate(userId);
    let username = user.username;
    ratings = user.ratings;

    if (username) {
        view.login.showPlayButton();
        view.login.disableValidateMeButton();
        view.login.setUsername(username);
    }
    
    view.login.setup(skills[0], skills[1]);
    setupEvents();

    view.loader.hide();
}

const setupEvents = () => {
    document.getElementById("usernameInput").addEventListener("input", handleUsernameInput);
    $("#validateButton").click(validateMe);
    $("#validateCollab").click(getIds);
    $("#playButton").click(onStart);

    $("#contentArea").attr("maxlength", maxPostLength);
    document.getElementById("contentArea").addEventListener("input", handleContentInputs);
    $("#continueButton").click(nextStep);
    $("#searchBtn").click(filter.search);
}

const validateMe = async () => {
    let username = await network.users.create($("#usernameInput").val(), userId);

    if (username) {
        view.login.showPlayButton();
        view.login.disableValidateMeButton();
    }
}

const validateCollab = async () => {
    let username = await network.users.validate(otherId);
    if (username) {
        $("#collabText").html("Ton??ta collaborateur??trice est " + username);
    }
}

const handleUsernameInput = async () => {
    let validateEnabled = $("#usernameInput").val().length > 3;
    if (validateEnabled) view.enableButton("validateButton");
    else view.disableButton("validateButton");
}

const handleContentInputs = async () => {
    let length = $("#contentArea").val().length;
    let minLength = commenting ? minCommentLength : minPostLength;
    let maxLength = commenting ? maxCommentLength : maxPostLength;

    $("#length").html(length);
    $("#maxLength").html(maxLength);

    if (length >= minLength) view.enableButton("continueButton");
    else view.disableButton("continueButton");
}

const nextStep = async () => {
    if (commenting) {
        let index = commentsCreated.length;
        let id = index === 0 ? userId : otherId;
        commentsCreated.push({ pid: postsToComment[index].pid, userId: id, comment: $("#contentArea").val() });
        // let resp = await network.posts.comment(commentsCreated[index]);
        responses.push(commentsCreated[index]);

        if (commentsCreated.length === postsToComment.length - 1) {
            view.replaceButton($("#continueButton"), "#downArrow");
        }

        if (commentsCreated.length === postsToComment.length) {
            posts.setup();
            return;
        }

        $("#contentArea").val("");
        handleContentInputs();
        view.tasks.setQuestion(postsToComment[index + 1].title);
        view.tasks.setContent(postsToComment[index + 1].content);
        return;
    }

    let index = postsCreated.length;
    let id = index === 0 ? userId : otherId;
    postsCreated.push({ title: questionsToAnswer[index], rating: 0, content: $("#contentArea").val(), categories: skills, userId: id, status: "underModeration" });
    let resp = await network.posts.create(postsCreated[index]);
    responses.push(resp.pid);
    
    if (postsCreated.length === questionsToAnswer.length) {
        setupCommenting();
    } else {
        $("#contentArea").val("");
        handleContentInputs();
        view.tasks.setQuestion(questionsToAnswer[index + 1]);
    }
}

const setupCommenting = async () => {
    if (!otherId) view.replaceButton($("#continueButton"), "#downArrow");
    $("#contentArea").attr("maxlength", maxCommentLength);
    commenting = true;

    for (let i = 0; i < (otherId ? 2 : 1); i++) {
        let found = shuffle(await network.posts.list({ categories: { $all: [skills[i]] }, status: "published" }));
        if (!found[0]) continue;
        postsToComment.push(found[0]);
    }

    postsToComment = shuffle(postsToComment);
    view.tasks.setQuestion(postsToComment[0].title);
    view.tasks.setupCommentingView(postsToComment[0].content);

    $("#contentArea").val("");
    handleContentInputs();
}

const onStart = async () => {
    await view.login.closeView();
    await timeout(1000);
    view.tasks.setupPostsView(skills, instructions.create, questionsToAnswer[0]);
}

getIds();
// $(onLoad);

// TESTING TOOLS ----------------------
const intoJson = (string) => {
    let texts = string.split("\n");
    let finalText = "";

    for (let i = 0; i < texts.length; i++) {
        finalText += '"' + texts[i] + '"' + ",\n";
    }

    return finalText;
}