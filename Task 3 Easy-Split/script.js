let members = [];
let expenses = [];


/* GET HTML ELEMENTS */

const memberInput =
    document.getElementById("memberInput");

const addMemberButton =
    document.getElementById("addMemberButton");

const memberList =
    document.getElementById("memberList");

const paidBy =
    document.getElementById("paidBy");

const participantCheckboxes =
    document.getElementById("participantCheckboxes");

const expenseName =
    document.getElementById("expenseName");

const expenseAmount =
    document.getElementById("expenseAmount");

const addExpenseButton =
    document.getElementById("addExpenseButton");

const expenseList =
    document.getElementById("expenseList");

const balanceList =
    document.getElementById("balanceList");

const settlementList =
    document.getElementById("settlementList");

const totalSpent =
    document.getElementById("totalSpent");

const totalMembers =
    document.getElementById("totalMembers");

const totalExpenses =
    document.getElementById("totalExpenses");

const themeButton =
    document.getElementById("themeButton");


/* LOAD SAVED DATA */

const savedMembers =
    localStorage.getItem("splitMembers");

const savedExpenses =
    localStorage.getItem("splitExpenses");


if (savedMembers) {

    members = JSON.parse(savedMembers);

}


if (savedExpenses) {

    expenses = JSON.parse(savedExpenses);

}


/* DISPLAY DATA */

renderMembers();

renderExpenses();

updateSummary();


/* ADD MEMBER */

addMemberButton.addEventListener(
    "click",
    function () {

        const name =
            memberInput.value.trim();


        if (name === "") {

            alert("Please enter a member name.");

            return;

        }


        if (members.includes(name)) {

            alert("This member already exists.");

            return;

        }


        members.push(name);

        memberInput.value = "";


        saveData();

        renderMembers();

        updateSummary();

    }
);


/* RENDER MEMBERS */

function renderMembers() {

    memberList.innerHTML = "";

    paidBy.innerHTML =
        '<option value="">Who paid?</option>';

    participantCheckboxes.innerHTML = "";


    members.forEach(
        function (member) {

            /* MEMBER TAG */

            const memberTag =
                document.createElement("span");

            memberTag.classList.add("member");

            memberTag.textContent = member;

            memberList.appendChild(memberTag);


            /* PAYER OPTION */

            const option =
                document.createElement("option");

            option.value = member;

            option.textContent = member;

            paidBy.appendChild(option);


            /* PARTICIPANT CHECKBOX */

            const label =
                document.createElement("label");

            label.classList.add("checkbox-item");


            label.innerHTML = `
                <input
                    type="checkbox"
                    value="${member}"
                    class="participant"
                >
                ${member}
            `;


            participantCheckboxes.appendChild(label);

        }
    );

}


/* ADD EXPENSE */

addExpenseButton.addEventListener(
    "click",
    function () {

        const name =
            expenseName.value.trim();

        const amount =
            Number(expenseAmount.value);

        const payer =
            paidBy.value;


        const selectedParticipants =
            Array.from(
                document.querySelectorAll(
                    ".participant:checked"
                )
            ).map(
                function (checkbox) {

                    return checkbox.value;

                }
            );


        if (
            name === "" ||
            amount <= 0 ||
            payer === ""
        ) {

            alert(
                "Please enter expense name, amount and payer."
            );

            return;

        }


        if (selectedParticipants.length === 0) {

            alert(
                "Select at least one participant."
            );

            return;

        }


        const expense = {

            id: Date.now(),

            name: name,

            amount: amount,

            payer: payer,

            participants:
                selectedParticipants

        };


        expenses.push(expense);


        /* CLEAR FORM */

        expenseName.value = "";

        expenseAmount.value = "";

        paidBy.value = "";


        document
            .querySelectorAll(".participant")
            .forEach(
                function (checkbox) {

                    checkbox.checked = false;

                }
            );


        saveData();

        renderExpenses();

        updateSummary();

    }
);


/* DISPLAY EXPENSES */

function renderExpenses() {

    expenseList.innerHTML = "";


    if (expenses.length === 0) {

        expenseList.innerHTML =
            `<p class="empty-message">
                No expenses added yet.
            </p>`;

        calculateBalances();

        return;

    }


    expenses.forEach(
        function (expense) {

            const share =
                expense.amount /
                expense.participants.length;


            const card =
                document.createElement("div");

            card.classList.add("expense-card");


            card.innerHTML = `

                <h3>
                    ${expense.name}
                </h3>

                <p>
                    💰 Amount:
                    ₹${expense.amount.toFixed(2)}
                </p>

                <p>
                    👤 Paid by:
                    ${expense.payer}
                </p>

                <p>
                    👥 Shared by:
                    ${expense.participants.join(", ")}
                </p>

                <p>
                    📊 Each person's share:
                    ₹${share.toFixed(2)}
                </p>


                <div class="expense-actions">

                    <button
                        class="edit-button"
                        onclick="editExpense(${expense.id})"
                    >
                        Edit
                    </button>


                    <button
                        class="delete-button"
                        onclick="deleteExpense(${expense.id})"
                    >
                        Delete
                    </button>

                </div>

            `;


            expenseList.appendChild(card);

        }
    );


    calculateBalances();

}


/* CALCULATE BALANCES */

function calculateBalances() {

    const balances = {};


    members.forEach(
        function (member) {

            balances[member] = 0;

        }
    );


    expenses.forEach(
        function (expense) {

            const share =
                expense.amount /
                expense.participants.length;


            /*
            PAYER GETS CREDIT
            */

            balances[expense.payer] +=
                expense.amount;


            /*
            PARTICIPANTS OWE THEIR SHARE
            */

            expense.participants.forEach(
                function (person) {

                    balances[person] -= share;

                }
            );

        }
    );


    displayBalances(balances);

    createSettlement(balances);

}


/* DISPLAY BALANCES */

function displayBalances(balances) {

    balanceList.innerHTML = "";


    members.forEach(
        function (member) {

            const balance =
                balances[member];


            const card =
                document.createElement("div");

            card.classList.add(
                "balance-card"
            );


            let statusClass =
                "balance-zero";

            let text =
                "Settled";


            if (balance > 0.01) {

                statusClass =
                    "balance-positive";

                text =
                    `Gets ₹${balance.toFixed(2)}`;

            }


            else if (balance < -0.01) {

                statusClass =
                    "balance-negative";

                text =
                    `Owes ₹${Math.abs(balance).toFixed(2)}`;

            }


            card.innerHTML = `

                <span>
                    ${member}
                </span>

                <span
                    class="${statusClass}"
                >
                    ${text}
                </span>

            `;


            balanceList.appendChild(card);

        }
    );

}


/* SETTLEMENT PLAN */

function createSettlement(balances) {

    settlementList.innerHTML = "";


    const creditors = [];

    const debtors = [];


    members.forEach(
        function (member) {

            const amount =
                balances[member];


            if (amount > 0.01) {

                creditors.push({

                    name: member,

                    amount: amount

                });

            }


            if (amount < -0.01) {

                debtors.push({

                    name: member,

                    amount:
                        Math.abs(amount)

                });

            }

        }
    );


    let creditorIndex = 0;

    let debtorIndex = 0;


    while (
        creditorIndex < creditors.length &&
        debtorIndex < debtors.length
    ) {

        const creditor =
            creditors[creditorIndex];

        const debtor =
            debtors[debtorIndex];


        const payment =
            Math.min(
                creditor.amount,
                debtor.amount
            );


        const settlement =
            document.createElement("div");


        settlement.classList.add(
            "settlement"
        );


        settlement.textContent =

            `${debtor.name} → ${creditor.name}
            ₹${payment.toFixed(2)}`;


        settlementList.appendChild(
            settlement
        );


        creditor.amount -= payment;

        debtor.amount -= payment;


        if (creditor.amount < 0.01) {

            creditorIndex++;

        }


        if (debtor.amount < 0.01) {

            debtorIndex++;

        }

    }


    if (
        creditors.length === 0 &&
        debtors.length === 0
    ) {

        settlementList.innerHTML =

            `<p class="empty-message">
                Everyone is settled! 🎉
            </p>`;

    }

}


/* DELETE EXPENSE */

function deleteExpense(id) {

    expenses =
        expenses.filter(
            function (expense) {

                return expense.id !== id;

            }
        );


    saveData();

    renderExpenses();

    updateSummary();

}


/* EDIT EXPENSE */

function editExpense(id) {

    const expense =
        expenses.find(
            function (item) {

                return item.id === id;

            }
        );


    if (!expense) {

        return;

    }


    expenseName.value =
        expense.name;

    expenseAmount.value =
        expense.amount;

    paidBy.value =
        expense.payer;


    document
        .querySelectorAll(".participant")
        .forEach(
            function (checkbox) {

                checkbox.checked =
                    expense.participants.includes(
                        checkbox.value
                    );

            }
        );


    expenses =
        expenses.filter(
            function (item) {

                return item.id !== id;

            }
        );


    saveData();

    renderExpenses();

    updateSummary();


    window.scrollTo({

        top: 250,

        behavior: "smooth"

    });

}


/* UPDATE SUMMARY */

function updateSummary() {

    let total = 0;


    expenses.forEach(
        function (expense) {

            total += expense.amount;

        }
    );


    totalSpent.textContent =
        `₹${total.toFixed(2)}`;


    totalMembers.textContent =
        members.length;


    totalExpenses.textContent =
        expenses.length;

}


/* SAVE DATA */

function saveData() {

    localStorage.setItem(
        "splitMembers",
        JSON.stringify(members)
    );


    localStorage.setItem(
        "splitExpenses",
        JSON.stringify(expenses)
    );

}


/* DARK MODE */

themeButton.addEventListener(
    "click",
    function () {

        document.body.classList.toggle(
            "dark-mode"
        );


        if (
            document.body.classList.contains(
                "dark-mode"
            )
        ) {

            themeButton.textContent = "☀️";

        }

        else {

            themeButton.textContent = "🌙";

        }

    }
);