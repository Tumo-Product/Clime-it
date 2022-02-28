const view = {
    enableButton        : (id) => {
        $(`#${id}`).removeClass("deactivated disabled");
    },

    disableButton       : (id) => {
        $(`#${id}`).addClass("deactivated disabled");
    },

    skillColors         : {
        decarbonization : "#B2B242",
        transportation  : "#62B585",
        awareness       : "#E0AB2F",
        clothing        : "#4B8879",
        digital         : "#4B7B3C"
    },

    loader: {
        hide: () => { $("#loadingScreen").hide(); },
        show: () => { $("#loadingScreen").show(); }
    },

    login: {
        setup: (first, second) => {
            $("#gradient").css("background", `radial-gradient(farthest-corner at 233px 221px, ${view.skillColors[first]} 0%,  ${view.skillColors[second]} 130%)`);
            if (second === undefined) {
                $("#gradient").css("background", `${view.skillColors[first]}`);
            }
        },
        setUsername: (username) => {
            $("#usernameInput").val(username);
            $("#usernameInput").addClass("disabled");
        },
        disableValidateMeButton: () => {
            $("#validateButton").addClass("disabled invisible");
        },
        showPlayButton      : () => {
            $("#playButton").removeClass("underView");
        },
        closeView      : () => {
            $("#playButton").addClass("disabled");
            $("#loginContainer").addClass("closedHorizontally");
            $("#whitespace").addClass("closedHorizontally");
            $("#playButton").addClass("disabled underView");
        }
    },

    tasks: {
        setQuestion: (question) => {
            $("#post #question").html(question);
        },

        setContent: (content) => {
            $("#post .content").html(content);
        },

        setupPostsView: async (skills, instruction, question) => {
            $("#shortInstruction").html(instruction);
            view.tasks.setQuestion(question);
            
            for (let i = 0; i < skills.length; i++) {
                $("#skillsContainer .skills").append(`<img src="../icons/skills/${skills[i]}.svg">`);
                if (i + 1 !== skills.length) {
                    $("#skillsContainer .skills").append(`<div class="separator"></div>`);
                }
            }

            $("#continueButton").removeClass("invisible");
            $("#post").removeClass("overView");
            $("#content").removeClass("closedVertically");

            await timeout(800);
            $("#shortInstruction").removeClass("invisible");
        },

        setupCommentingView: async (content) => {
            $("#contentArea").addClass("comment");
            $("#post").addClass("comment");
            $("#post .content").html(content);

            await timeout(110);
            $("#contentArea").attr("placeholder", "Your comment");

            await timeout(600);
            $("#post .content").removeClass("invisible");
        }
    }
}