class ArrayUtil {
    static isInArray(arr,value) {
        for(let i = 0; i < arr.length; i++){
            if(value === arr[i]){
                return true;
            }
        }
        return false;
    }
}

export default ArrayUtil;
