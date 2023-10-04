
/**
 * A function that checks if a file is a text file
 * @param {File} file 
 * @returns {Boolean} - True if the file is a text file
 */
function isTextFile(file) {
    return file.type === 'text/plain';
}

/**
 * A function that checks the files uploaded by the user
 * @returns {Promise} - A promise that resolves to an array of the file contents in string format
 */
function checkFiles(worldFile, file1, file2) {

    // Check if all files are uploaded
    if (!worldFile || !file1 || !file2) {
        alert('Please upload all three files.');
        return Promise.reject(new Error('Missing files'));
    }

    const files = [worldFile, file1, file2];
    const nonTextFiles = [];
    const promises = [];

    // Check if all files are text files
    for (let file of files) {
        if (!isTextFile(file)) {
            nonTextFiles.push(file.name);
        } else {
            const reader = new FileReader();
            const promise = new Promise((resolve, reject) => {
                reader.onload = () => {
                    resolve(reader.result);
                };
                reader.onerror = () => {
                    reject(reader.error);
                };
            });
            reader.readAsText(file);
            promises.push(promise);
        }
    }

    // If there are non-text files, reject the promise
    if (nonTextFiles.length > 0) {
        alert(`The following files are not text files: ${nonTextFiles.join(', ')}`);
        return Promise.reject(new Error('Non-text files'));
    }

    // Return a promise that resolves to an array of the file contents in string format
    return Promise.all(promises);
}




export { checkFiles };