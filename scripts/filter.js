const filter = {
    activated: {},

    add: (skill) => {
        filter.activated[skill] = false;
        let obj = filterView.add(skill);

        obj.click(() => { filter.bySkill(skill) });
    },

    bySkill: async (skill) => {
        if (filter.getActivatedCount() === 0) {
            filterView.disableAll();
        }

        if (filter.activated[skill]) {
            filterView.disable(skill);
            filter.activated[skill] = false;
        } else {
            filterView.enable(skill);
            filter.activated[skill] = true;
        }

        await posts.reset();

        let queries = [];
        for (const skill in filter.activated) {
            if (filter.activated[skill]) {
                queries.push({ categories: { $all: [skill] } });
            }
        }

        posts.setup(queries);
    },

    search: async () => {
        let query = $("#searchBar").val().trim();
        await posts.reset();
        
        let queries = [{ title: { $regex: query, $options: "i" } }, { content: { $regex: query, $options: "i" } }]; // options: i means case insensitive
        posts.setup(queries);
    },

    getActivatedCount: () => {
        let count = 0;
        for (const key in filter.activated) {
            if (filter.activated[key]) {
                count++;
            }
        }

        return count;
    }
}

const filterView = {
    add: (skill) => {
        $("#filterButtons").append(`
        <div id="${skill}" class="circle filterButton">
            <img class="inactive" src="../icons/skills/${skill}Deactivated.svg">
            <img class="active" src="../icons/skills/${skill}.png">
        </div>`);

        return $(`#${skill}`);
    },

    enable: (skill) => {
        $(`#${skill}`).removeClass("deactivated");
    },

    disable: (skill) => {
        $(`#${skill}`).addClass("deactivated");
    },

    disableAll: () => {
        $(".filterButton").addClass("deactivated");
    },

    emptyContainer: async () => {
        $("#container .term").addClass("disappear");
        await timeout(500);
        $("#container .term").remove();
        $(".row").remove();
    },

    makeTermsAppear: async () => {
        $("#container .term").addClass("appear");
    },

    show    : () => {
        $("#filter").css("display", "flex");
    }
}