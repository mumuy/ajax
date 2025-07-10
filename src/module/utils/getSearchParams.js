export default function(param,patch = {}){
    let data = Object.assign({},param,patch);
    return (new URLSearchParams(data)).toString();
}