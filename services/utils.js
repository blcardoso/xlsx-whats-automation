function randomTimer() {
    const numbers = [1000, 2000, 3000, 4000, 5000];
    const randomIndex = Math.floor(Math.random() * numbers.length);
    return numbers[randomIndex];
}

module.exports = {
    randomTimer
}