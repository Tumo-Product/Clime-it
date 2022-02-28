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

const onLoad = async () => {
    getIds();

    let name    = await network.getSetName();
    let data    = await network.getData();
    skills      = name.split("_");

    for (let i = 0; i < skills.length; i++) {
        let currQuestions = shuffle(data.questions[skills[i]]);
        questionsToAnswer.push(currQuestions[0]);
        if (otherId === undefined) break;
    }

    instructions = data.instructions;

    let username = await network.users.validate(userId);
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
    $("#validateButton").click(validateMe);
    $("#validateCollab").click(validateCollab);
    $("#playButton").click(onStart);


    $("#contentArea").attr("maxlength", maxPostLength);
    document.getElementById("contentArea").addEventListener("input", handleContentInputs);
    $("#continueButton").click(nextStep);
}

const validateMe = async () => {
    let username = await network.users.create($("#usernameInput").val(), userId);

    if (username) {
        view.login.showPlayButton();
        view.login.disableValidateMeButton();
    }
}

const validateCollab = async () => {
    getIds();
    let username = await network.users.validate(otherId);
}

const handleContentInputs = async () => {
    let length = $("#contentArea").val().length;
    let minLength = commenting ? minCommentLength : minPostLength;
    let maxLength = commenting ? maxCommentLength : maxPostLength;

    $("#length").html(length);
    $("#maxLength").html(maxLength);

    if (length >= minLength) {
        view.enableButton("continueButton");
    } else {
        view.disableButton("continueButton");
    }
}

const nextStep = async () => {
    if (commenting) {
        let index = commentsCreated.length;
        let id = index === 0 ? userId : otherId;
        commentsCreated.push({ pid: postsToComment[index].pid, userId: id, comment: $("#contentArea").val() });
        let resp = await network.posts.comment(commentsCreated[index]);
        console.log(resp);

        if (commentsCreated.length === postsToComment.length) {
            // TODO: switch to all posts view.
            console.log("done");
        } else {
            $("#contentArea").val("");
            handleContentInputs();
            view.tasks.setQuestion(postsToComment[index + 1].title);
            view.tasks.setContent(postsToComment[index + 1].content);
        }
        return;
    }

    let index = postsCreated.length;
    let id = index === 0 ? userId : otherId;
    postsCreated.push({ title: questionsToAnswer[index], rating: 0, content: $("#contentArea").val(), categories: skills, userId: id, status: "underModeration" });
    let resp = await network.posts.create(postsCreated[index]);                                                                                                       // TODO: add error checking, for the "Copied" err response first of all.
    console.log(resp);
    
    if (postsCreated.length === questionsToAnswer.length) {
        setupCommenting();
    } else {
        $("#contentArea").val("");
        handleContentInputs();
        view.tasks.setQuestion(questionsToAnswer[index + 1]);
    }
}

const setupCommenting = async () => {
    $("#contentArea").attr("maxlength", maxCommentLength);
    commenting = true;

    for (let i = 0; i < skills.length; i++) {
        let found = await network.posts.list({ categories: { $all: [skills[i]] } });        // TODO: Filter by published posts.
        for (let f = 0; f < found.length; f++) {
            if (postsToComment.includes(found[f])) {
                found.splice(f, 1);
            }
        }
        
        postsToComment = postsToComment.concat(found);
        if (otherId === undefined && postsToComment.length !== 0) break;
    }

    postsToComment = shuffle(postsToComment);
    if (postsToComment.length === 1) postsToComment.push(postsToComment[0]);
    postsToComment.splice(2);
    view.tasks.setQuestion(postsToComment[0].title);
    view.tasks.setupCommentingView(postsToComment[0].content);

    $("#contentArea").val("");
    handleContentInputs();
}

const onStart = async () => {
    view.login.closeView();
    await timeout(1000);
    view.tasks.setupPostsView(skills, instructions.create, questionsToAnswer[0]);
}

$(onLoad);