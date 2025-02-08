/** @format */
import { jsPDF } from "jspdf";
const doc = new jsPDF();

const taskForm = document.getElementById("new-task-form");
const shortTermTasks = document.querySelector("#short-term-tasks .task-list");
const longTermTasks = document.querySelector("#long-term-tasks .task-list");
const generatePdfBtn = document.querySelector(".generate-btn");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

function saveTasks() {
     localStorage.setItem("tasks", JSON.stringify(tasks));
}




function renderTasks() {
     shortTermTasks.innerHTML = "";
     longTermTasks.innerHTML = "";

     tasks.forEach((task) => {
          const taskElement = document.createElement("div");
          taskElement.className = "task";
          taskElement.dataset.taskId = task.id;

          taskElement.innerHTML = `
            <span>${task.name} - <em>${task.category}</em> - ${getRemainingTime(
               task.dueDate,
          )}</span>
            <div>
                 <button>Edit</button>
                <button>Delete</button>
            </div>
        `;

          if (task.completed) {
               taskElement.classList.add("completed");
          } else if (new Date(task.dueDate) < new Date()) {
               taskElement.classList.add("overdue");
          }

          if (task.category === "1-Day to 7-Day") {
               shortTermTasks.appendChild(taskElement);
          } else {
               longTermTasks.appendChild(taskElement);
          }
     });
}

document.querySelectorAll(".task-list").forEach((list) => {
     list.addEventListener("click", (e) => {
          // Handle text node clicks
          const target =
               e.target.nodeType === 3 ? e.target.parentElement : e.target;
          const button = target.closest("button");
          if (!button) return;

          const taskElement = button.closest(".task");
          const taskId = parseInt(taskElement.dataset.taskId);

          // Trim whitespace for accurate comparison
          if (button.textContent.trim() === "Edit") {
               editTask(taskId);
          } else if (button.textContent.trim() === "Delete") {
               deleteTask(taskId);
          }
     });
});
function addTask(event) {
     event.preventDefault();
     const name = document.getElementById("task-name").value;
     const category = document.getElementById("task-category").value;
     const dueDate = document.getElementById("task-due-date").value;
     const notes = document.getElementById("task-notes").value;

     const newTask = {
          id: Date.now(),
          name,
          category,
          dueDate,
          notes,
          completed: false,
     };

     tasks.push(newTask);
     saveTasks();
     renderTasks();
     taskForm.reset();
}

function deleteTask(id) {
     const index = tasks.findIndex((task) => task.id === id);
     if (index !== -1) {
          tasks.splice(index, 1);
          saveTasks();
          renderTasks();
     }
}

function editTask(id) {
     const task = tasks.find((task) => task.id === id);
     if (task) {
          document.getElementById("task-name").value = task.name;
          document.getElementById("task-category").value = task.category;
          document.getElementById("task-due-date").value = task.dueDate;
          document.getElementById("task-notes").value = task.notes;

       
          taskForm.onsubmit = function (event) {
               event.preventDefault();
               task.name = document.getElementById("task-name").value;
               task.category = document.getElementById("task-category").value;
               task.dueDate = document.getElementById("task-due-date").value;
               task.notes = document.getElementById("task-notes").value;

               saveTasks();
               renderTasks();
               taskForm.reset();
               taskForm.onsubmit = addTask; 
          };
     }
}

function getRemainingTime(dueDate) {
     const now = new Date();
     const due = new Date(dueDate);
     const diff = due - now;

     if (diff <= 0) return "Overdue";

     const days = Math.floor(diff / (1000 * 60 * 60 * 24));
     if (days > 0) return `${days} days left`;

     const hours = Math.floor(
          (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
     );
     return `${hours} hours left`;
}

taskForm.onsubmit = function (event) {
     event.preventDefault();
     tasks.name = document.getElementById("task-name").value;
     tasks.category = document.getElementById("task-category").value;
     tasks.dueDate = document.getElementById("task-due-date").value;
     tasks.notes = document.getElementById("task-notes").value;

     saveTasks();
     renderTasks();
     taskForm.reset();
     taskForm.onsubmit = addTask; 
};

renderTasks();



// 📌 PDF Generation Function
function generatePDF() {
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("To-Do List", 10, 10);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);

    let y = 20; // Initial Y position for text

    tasks.forEach((task, index) => {
        if (y > 270) {
            doc.addPage(); // Add new page if content exceeds the limit
            y = 10;
        }
        doc.text(
            `${index + 1}. ${task.name} (${task.category}) - Due: ${task.dueDate}`,
            10,
            y
        );
        if (task.notes) {
            doc.text(`   Notes: ${task.notes}`, 10, y + 6);
            y += 10;
        } else {
            y += 8;
        }
    });

    doc.save("To-Do-List.pdf");
}

// 📌 Attach Event Listener to Generate PDF Button
generatePdfBtn.addEventListener("click", generatePDF);