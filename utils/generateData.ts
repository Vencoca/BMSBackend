export function generateData({start, end, points, minValue, maxValue, precision,} : {start : Date, end: Date, points : number, minValue: number, maxValue: number, precision: number}){
    if(start < end){
        throw new Error("Error - end date is before start date!")
    }

    const timeDifference = end.getTime() - start.getTime();
    const timeInterval = timeDifference / (points - 1);
    const data = [];

    for (let i = 0; i < points; i++) {
        const currentTime = start.getTime() + i * timeInterval;
        const randomValue = parseFloat((Math.random() * (maxValue - minValue) + minValue).toFixed(precision));
        data.push({ date: currentTime, value: randomValue });
    }
    
    return data;
}