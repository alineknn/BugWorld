
  const submit_button = document.getElementById("submit_btn");
  submit_button.addEventListener('click', async () => {
    try {
    let world_file, file1, file2;
    world_file = document.getElementsByName("world_map")[0].files[0];
    console.log(world_file);
    file1 = document.getElementsByName("bug_asm_1")[0].files[0];
    file2 = document.getElementsByName("bug_asm_2")[0].files[0];
    console.log(world_file);
    const reader = new FileReader();
    reader.readAsText(world_file);
    reader.onload = () => {
    const text = reader.result;
    localStorage.setItem("map",text);

    }
    const reader2 = new FileReader();
    reader2.readAsText(file1);
    reader2.onload = () => {
    const text = reader2.result;
    localStorage.setItem("bug1",text);

    }
    const reader3 = new FileReader();
     reader3.readAsText(file1);
     reader3.onload = () => {
     const text = reader3.result;
     localStorage.setItem("bug2",text);
      }
     window.location.href = "game.html";
     }
     catch (error) {
      console.error(error);
    }
  })