const view = {
    height  : 650,

    enableButton        : (id) => {
        $(`#${id}`).removeClass("deactivated disabled");
    },

    disableButton       : (id) => {
        $(`#${id}`).addClass("deactivated disabled");
    },

    replaceButton      : (obj, icon) => {
        obj.find("img").removeClass("current");
        obj.find(icon).addClass("current");
    },

    move        : (direction) => {
        let top = parseFloat($("#views").css("top"));
        top += direction * view.height;
        $("#views").css({ "top": top });
    },

    addSkills   : (container, skills) => {
        for (let i = 0; i < skills.length; i++) {
            container.find(".skills").append(`<img src="../icons/skills/${skills[i]}.png">`);
            if (i + 1 !== skills.length) {
                container.find(".skills").append(`<div class="separator"></div>`);
            }
        }
    },

    skillColors         : {
        decarbonization : "#B2B242",
        greening        : "#64b444",
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
            $("#gradient").css("background", `radial-gradient(circle at 762px 762px, ${view.skillColors[first]} 16%,  ${view.skillColors[second]} 60%)`);
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
        closeView      : async () => {
            $("#playButton").addClass("disabled");

            $("#glassesContainer").addClass("underLoginContainer");
            await timeout(1000);

            let elements = [$("#loginContainer"), $("#whitespace")];

            for (let element of elements) {
                let marginTop = parseFloat(element.css("height")) / 2;
                element.addClass("closedVertically");
                element.addClass("invisible");
                element.css("margin-top", marginTop)
            }

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
            
            view.addSkills($("#skillsContainer"), skills);

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