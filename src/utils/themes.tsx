import storage from "./storage"

export interface Theme {
    name: string,
    class: string
}
const themes = [
    { name: "System", class: "default" },
    { name: "Light", class: "light" },
    { name: "Dark", class: "dark" },
]

export async function applyTheme(theme: Theme){
    await storage.setLocal("curTheme", theme.class)
    themes.forEach((thm) => {
        document.body.classList.remove(thm.class);
    });

    document.body.classList.add(theme.class);
}

export async function applySavedTheme(){
    let savedTheme = await getCurrentTheme();
    let theme = themes.filter((t) => t.class === savedTheme)[0]
    themes.forEach((thm) => {
        document.body.classList.remove(thm.class);
    });

    document.body.classList.add(theme.class);
}
export async function getCurrentTheme(){
    return await storage.getLocalWithDefault("curTheme", "default")
}
export default themes