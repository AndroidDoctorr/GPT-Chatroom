export const getInitials = (fullName) => {
    // Split the full name into words
    const words = fullName.split(' ')
    // Initialize an empty string to store the initials
    let initials = ''
    // Loop through each word in the array
    for (let i = 0;i < words.length;i++) {
        const word = words[i]
        // Ensure the word is not empty
        if (word.length > 0) {
            // Capitalize the first character of the word
            const capitalizedWord = word.charAt(0).toUpperCase()
            // If it's the first or last word, add the initial to the result
            if (i === 0 || i === words.length - 1) {
                initials += capitalizedWord
            }
        }
    }

    return initials
}