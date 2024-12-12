export const printHeader = (heading: string, contents: string) => {
    console.log(`\n\n ${"-".repeat(20)} ${heading} - START ${"-".repeat(20)} \n\n`);
    console.log(contents);
    console.log(`\n\n ${"-".repeat(20)} ${heading} - END ${"-".repeat(20)} \n\n`);
};
