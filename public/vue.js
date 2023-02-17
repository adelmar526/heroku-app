const API_URL = "https://web-app-cw2.herokuapp.com/api";
// const API_URL = "http://localhost:3000/api"

let app = new Vue({
    el: "#app",
    data: {
        lessons: [],
        sortBy: "topic",
        sortOrder: "asc",
        activePage: "lessons",
        name: "",
        phone: "",
        targetLesson: null,
        searchTerm: "",
    },
    methods: {
        togglePage() { // allows us to swap between the pages
            if (this.activePage === "lessons") {
                this.activePage = "confirm";
            } else {
                this.activePage = "lessons"
            }
        },
        purchaseLesson(lesson) { // this allows the lesson confirmation to come up before booking the lesson
            this.targetLesson = lesson;
            this.togglePage();
        },
        cancelLesson() {
            this.targetLesson = null;
            this.togglePage();
        },
        async confirm() { // post request which allows us to add the information below to our order section of the database 
            await fetch(`${API_URL}/order`, {
                method: "POST",
                body: JSON.stringify({
                    name: this.name,
                    phone: this.phone,
                    lesson_id: this.targetLesson._id,
                    space: 1,
                }),

            }).then(async(response) => { // waits for request to be complete and converts response to Json
                let data = await response.json();

                await fetch(`${API_URL}/lesson/${this.targetLesson._id}`, { // the put request to the endpoint  which which the fetch function seraches for the id of the selectedlesson.
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ // The json data of space which was previously set to 1 will update to x amount of spcaes
                        space: 1,
                    }),
                }).then(() => {
                    Swal.fire({ // uses sweetalert library to display messages to user
                        title: "Confirmed!", // we will display a message which contains a title, the customers info and an icon
                        text: `${this.name} Thank You for your Purchase. We wiil reach out to you on ${this.phone}. ${data.msg}`,
                        icon: "success",
                        confirmButtonText: "Amazing",
                    }).then((result) => { // this will allow to callback the result to user confrimation of message
                        if (result.isConfirmed) {
                            window.location.reload(); // will reload the page after confirmation
                        }
                    });
                });
            });
        },
        async find() { // search function through api endpoint
            let response = await fetch(`${API_URL}/search/${this.searchTerm}`, { //search function is used for the fetch get request to the api using searchTerm
                method: "GET",
            });
            let data = await response.json(); // stores response and allows us to call it using response.json
            this.lessons = data;

            console.log("data: ", data); // log message will format the values and process data.
        },
        async findLessons() { // allows us to retrieve all lessons stored in the database
            let response = await fetch(`${API_URL}/lesson`, {
                method: "GET",
            });
            let data = await response.json();
            this.lessons = data;
        }
    },
    computed: {
        sortedLessons: function() {
            // for ascending sorting
            if (this.sortOrder === "asc") {
                return this.lessons.sort((a, b) =>
                    a[this.sortBy] > b[this.sortBy] ?
                    1 :
                    b[this.sortBy] > a[this.sortBy] ?
                    -1 :
                    0
                );
            }
            // for descending sorting
            return this.lessons.sort((a, b) =>
                a[this.sortBy] > b[this.sortBy] ?
                -1 :
                b[this.sortBy] > a[this.sortBy] ?
                1 :
                0
            );
        },
        checkChkout: function() {
            let Namecheck = /^[a-zA-Z\s]*$/.test(this.name); // regex is used to check that name is letters only
            let phonecheck = /^[0-9]+$/.test(this.phone) && this.phone.length > 10; // regex is used to check that the phone number is 11 digits and only numbers
            return Namecheck && phonecheck;
        },
    },
    mounted() {
        this.findLessons()
    },
    watch: { // function allows searchTerm to change values when a letter is being typed
        searchTerm() {
            if (this.searchTerm) {
                this.find();
            } else {
                this.findLessons();
            }
        },
    },

});