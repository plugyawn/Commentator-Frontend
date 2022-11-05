const entityClassMap = {
  person: "bg-orange-200",
  orgnz: "bg-yellow-200",
  product: "bg-lime-200",
  date: "bg-cyan-200",
  place: "bg-blue-200",
  slang: "bg-purple-200",
  none: "bg-transparent",
};
const passage = document.querySelector("#passage");
const tagList = document.querySelector(".tag-list");
const fileImportBtn = document.querySelector(".file-import-btn");
const saveBtn = document.querySelector(".save-btn");
const fileInput = document.querySelector("#fileImport");
const predictorBtn = document.querySelector(".predictor-btn");

let selectedTagEl = document.querySelector(".tag.active");
let currentTag = selectedTagEl.innerText.toLowerCase();
let currentTarget = "";
let currentPassageText = passage.innerText;

function adjustText(holder) {
  text = holder.innerText.split(" ");
  holder.innerHTML = "";
  for (let i = 0; i < text.length; i++) {
    text[i] = text[i].replace("\n", "");
    let newText = document.createElement("span");
    let leadSpace = document.createTextNode(" ");
    let endSpace = document.createTextNode(" ");
    newText.innerHTML = text[i];
    newText.dataset.entity = "none";
    newText.classList.add("rounded-sm", "p-0.5", "bg-transparent");
    holder.appendChild(leadSpace);
    holder.appendChild(newText);
    holder.appendChild(endSpace);
  }
}

function handleTagClick(e) {
  if (e.target.tagName == "BUTTON") {
    selectedTagEl.classList.remove("active");
    selectedTagEl = e.target;
    selectedTagEl.classList.add("active");
    currentTag = selectedTagEl.innerText.toLowerCase();
  }
}

function handleWordClick(e) {
  if (e.target.tagName == "SPAN" && e.target.innerHTML) {
    // based on the current tag selected, update the span
    currentTarget = e.target;
    currentTarget.classList.remove(
      entityClassMap[currentTarget.dataset.entity]
    );
    currentTarget.dataset.entity = currentTag;
    currentTarget.classList.add(entityClassMap[currentTag]);
  }
}

function handleFileImport() {
  let file = Array.from(fileInput.files)[0];

  if (file) {
    let reader = new FileReader();
    reader.readAsText(file, "UTF-8");
    reader.onload = function (e) {
      currentPassageText = e.target.result;
      passage.innerHTML = currentPassageText;
      adjustText(passage);
    };
    reader.onerror = function (e) {
      fileInput.innerHTML = "error reading file";
    };
  }
}

function handleSaveClick(e) {
  // document.querySelectorAll(".rounded-sm").forEach((e) => {
  //   console.log(e.dataset.entity);
  // });
  let data = [];
  let children = passage.children;
  for (let i = 0; i < children.length; i++) {
    // if (children[i].innerText.includes(tagArray[0])) {
    //   for (let j = i; j < i + tagArray.length; j++) {
    //     handleWordClick({ target: children[j] });
    //   }
    //   break;
    // }
    if (children[i].dataset.entity != "none") {
      data.push({
        Word: children[i].innerText,
        Tag: children[i].dataset.entity,
      });
    }
  }
  console.log(data);
  fetch("http://localhost:8080/saveFrequency", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
    });
}

function handlePredictClick() {
  let data = {
    data: currentPassageText,
  };
  fetch("http://localhost:8080/initialTagging", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      data.forEach((tag) => {
        tag.word;
        let index = tag.start;
        while (true) {
          if (currentPassageText[index] == " ") {
            break;
          }
          index -= 1;
        }
        tagArray = currentPassageText.substring(index + 1, tag.end).split(" ");
        let entity_group = tag.entity_group.toLowerCase();
        currentTag = entity_group == "organisation" ? "orgnz" : entity_group;

        let children = passage.children;
        for (let i = 0; i < children.length; i++) {
          if (children[i].innerText.includes(tagArray[0])) {
            for (let j = i; j < i + tagArray.length; j++) {
              handleWordClick({ target: children[j] });
            }
            break;
          }
        }
      });
    });
}

function init() {
  passage.addEventListener("click", handleWordClick);
  tagList.addEventListener("click", handleTagClick);
  saveBtn.addEventListener("click", handleSaveClick);
  fileImportBtn.addEventListener("click", () => {
    fileInput.click();
  });
  fileInput.onchange = handleFileImport;
  predictorBtn.addEventListener("click", handlePredictClick);

  adjustText(passage);
}

init();
