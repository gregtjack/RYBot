import fs from 'fs'

export default class Database {
    public static readFile(path: string): Object {
        const file = fs.readFileSync(path, { encoding: 'utf-8' })
        return JSON.parse(file);
    }

    public static writeFile(path: string, obj: Object): void {
        const data = JSON.stringify(obj)
        fs.writeFile(path, data, err => {
            console.error(err)
        })
    }
}