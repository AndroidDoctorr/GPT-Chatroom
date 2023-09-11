export const getRandomColor = () => {
    // Generate a random color in hexadecimal format
    const randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16)
    return randomColor
}