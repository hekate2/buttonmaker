"use strict";

(function() {
  let dragIndex;

  window.addEventListener("load", init);

  /** Adds event listeners and initializes button */
  function init() {
    let menuTabs = qsa("aside > ul > li:not(:first-child)");
    let styleOptions = qsa("section.base input, section.base select, #new_image");
    let imageDims = qsa("#new_image_height, #new_image_width");
    let details = qsa("section.extra li");

    id("save_img").addEventListener("click", saveImage);
    qs(".text > form").addEventListener("submit", function(e) {
      e.preventDefault();
      drawText();
    });

    for (let i = 0; i < details.length; i++) {
      details[i].addEventListener("click", appendImage);
    }
    
    for (let i = 0; i < menuTabs.length; i++) {
      menuTabs[i].addEventListener("click", toggleTabs);
    }
    
    for (let i = 0; i < styleOptions.length; i++) {
      styleOptions[i].addEventListener("change", updateStyles);
    }

    for (let i = 0; i < imageDims.length; i++) {
      imageDims[i].addEventListener("change", setImageDims);
    }
    
    buildABase();
  }

  /** Appends an image to the stage when selected */
  function appendImage() {
    var itm = this.querySelector("img");
    var image = itm.cloneNode(true);

    makeDraggable(image);
    makeRemoveable(image);
    setToStage(image, "glow_box");
  }

  function setToStage(elem, anim) {
    elem.classList.add(anim);
    setTimeout(() => {
      elem.classList.remove(anim);
    }, 5000);
    qs(".button").appendChild(elem);
  }

  /** Creates a text element based on input and appends it to the stage */
  function drawText() {
    let wordContent = id("text_content").value;
    let fontFamily = id("font_family").value;
    let textDecoration = id("text_decoration").value;
    let fontStyle = id("font_style").value;
    let fontWeight = id("font_weight").value;
    let fontSize = id("font_size").value + "pt";
    let fontColor = id("font_color").value;

    console.log(fontFamily);

    let text = document.createElement("div");
    text.style["font"] = fontStyle + " " + fontWeight + " " + fontSize + " '" + fontFamily + "'";
    text.style["textDecoration"] = textDecoration;
    text.style["color"] = fontColor;
    text.textContent = wordContent;

    makeRemoveable(text);

    setToStage(text, "glow_text");
    makeDraggable(text);
  }
  
  /**
   * Opens a tab based on the value of the clicked
   * tab.
   * @param {Event} e - the user's click event
   */
  function toggleTabs(e) {
    let selector = this.getAttribute("data-value");
    console.log(selector);
    let visible = qsa(".visible");
    let allWithClass = qsa("." + selector);

    for (let i = 0; i < visible.length; i++) {
      visible[i].classList.remove("visible");
    }

    for (let i = 0; i < allWithClass.length; i++) {
      allWithClass[i].classList.add('visible');
    }
  }
  
  /** Builds a button based on values in the input */
  function buildABase() {
    let toSearch = qsa("section.base input, section.base select");
    
    let button = document.createElement("div");
    button.classList.add('button');
    makeDraggable(button);
    
    for (let i = 0; i < toSearch.length; i++) {
      let newStyle = toSearch[i].getAttribute("name");

      if (newStyle === "border-width") {
        button.style[newStyle] = toSearch[i].value + "px";
        button.style["height"] = 31 - (2 * toSearch[i].value) + "px";
        button.style["width"] = 88 - (2 * toSearch[i].value) + "px";
      } else {
        button.style[newStyle] = toSearch[i].value;
      }
    }

    id("stage").appendChild(button);
  }
  
  /**
   * Changes the styles of the button based on values set by
   * the user.
   * @param {Event} e - the event of the changed input value 
   */
  function updateStyles(e) {
    let toUpdate = this.getAttribute("name");
    console.log(toUpdate);

    if (this.getAttribute("type") === "file") {
      imgUpload(e, toUpdate);
    } else if (this.getAttribute("type") === "number") {
      intUpload(e, toUpdate);
    } else {
      qs(".button").style[toUpdate] = this.value;
    }
  }

  /**
   * Updates the styles if the value to update accepts integers.
   * @param {Event} e - the event of the value getting changed.
   * @param {String} styles - the style to change.
   */
  function intUpload(e, styles) {
    if (styles === "border-width") {
      qs(".button").style["height"] = 31 - (2 * e.target.value) + "px";
      qs(".button").style["width"] = 88 - (2 * e.target.value) + "px";
    }
    qs(".button").style[styles] = e.target.value + "px";
  }
  
  /**
   * Updates the styles if the value to update accepts and image.
   * @param {Event} e - the event of the value getting changed.
   * @param {String} styles - the style to change.
   */
  function imgUpload(e, styles) {
    let imgInput = URL.createObjectURL(e.target.files[0]);
      
    if (styles === "background") {
      qs(".button").style[styles] = "url(" + imgInput + ")";
      qs(".button").style["backgroundSize"] = id("background_size").value;
    } else {
      let newImage = document.createElement("img");
      let hiddenDims = qsa(".menu ul li.hidden");

      newImage.src = imgInput;

      console.log(newImage);

      if (qsa(".active_img").length > 0) {
        qs(".active_img").classList.remove("active_img");
      }

      for (let i = 0; i < hiddenDims.length; i++) {
        hiddenDims[i].classList.remove("hidden");
      }
      
      newImage.classList.add("active_img");
      makeDraggable(newImage);
      makeRemoveable(newImage);

      qs("input[name='new-image']").value = "";
      setToStage(newImage, "glow_box");

      setImageDims();
    }
  }

  /** Sets the dimensions of the active uploaded image */
  function setImageDims() {
    let image = qs(".active_img");

    image.style.height = id("new_image_height").value + "px";
    image.style.width = id("new_image_width").value + "px";
  }

  /**
   * On double click, the item becomes removable
   * @param {Element} item - the item that is being
   * made removable
   */
  function makeRemoveable(item) {
    item.addEventListener("dblclick", function() {
      this.remove();
    })
  }

  /** SAves an image using html2canvas */
  async function saveImage() {
    let canvas = await html2canvas(qs(".button"), {
      scale: 1,
      backgroundColor: null
    });

    var link = document.createElement('a');
    link.download = 'button.gif';
    link.href = canvas.toDataURL("image/gif");
    link.click();
  }

  /**
   * Makes stuff dragabble
   * @param {*} elmnt element to be made draggable
  */
  function makeDraggable(elmnt) {
    // I named it that because it was a POS to write!!
    let pos = {
      pos1: 0,
      pos2: 0,
      pos3: 0,
      pos4: 0
    };

    if (elmnt.length) {
      for (let i = 0; i < elmnt.length; i++) {
        elmnt[i].addEventListener('mousedown', function(e) {
          e.preventDefault();
          e.stopPropagation();
          dragIndex += 1;
          this.style["zIndex"] = dragIndex;
          pos["pos3"] = e.clientX;
          pos["pos4"] = e.clientY;
          this.addEventListener('mousemove', dragElement);
        });
        elmnt[i].addEventListener('mouseup', removeDrag);
      }
    } else {
      elmnt.addEventListener('mousedown', function(e) {
        e.preventDefault();
        e.stopPropagation();
        dragIndex += 1;
        this.style["zIndex"] = dragIndex;
        pos["pos3"] = e.clientX;
        pos["pos4"] = e.clientY;
        this.addEventListener('mousemove', dragElement);
      });
      elmnt.addEventListener('mouseup', removeDrag);
    }

    /**
     * Changes the position when the mouse is pressed
     * @param {Event} e - the event of the
     * element being dragged
     */
    function dragElement(e) {
      pos = {
        pos1: pos["pos3"] - e.clientX,
        pos2: pos["pos4"] - e.clientY,
        pos3: e.clientX,
        pos4: e.clientY
      }

      let left = this.offsetLeft - pos["pos1"];
      let top = this.offsetTop - pos["pos2"];

      this.style.top = top + "px";
      this.style.left = left + "px";
    }

    /** Removes the drag */
    function removeDrag() {
      this.removeEventListener('mousemove', dragElement);
    }
  }

  /* ------------------------------ Helper Functions  ------------------------------ */
  /**
   * Returns the element that has the ID attribute with the specified value.
   * @param {string} id - element ID
   * @return {object} DOM object associated with id.
   */
  function id(id) {
    return document.getElementById(id);
  }

  /**
   * Returns the first element that matches the given CSS selector.
   * @param {string} query - CSS query selector.
   * @returns {object[]} array of DOM objects matching the query.
   */
  function qs(query) {
    return document.querySelector(query);
  }

  /**
   * Returns the array of elements that match the given CSS selector.
   * @param {string} query - CSS query selector
   * @returns {object[]} array of DOM objects matching the query.
   */
  function qsa(query) {
    return document.querySelectorAll(query);
  }
})();