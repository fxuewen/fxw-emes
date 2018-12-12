const prefixMap = {
    datalist: 1
};

class UidUtil {
    // 根据前缀生成id
    static getIdByPrefix(prefix) {
        if (!prefixMap[prefix]) {
            prefixMap[prefix] = 1;
        } else {
            prefixMap[prefix] += 1;
        }

        return `${prefix}_${prefixMap[prefix]}`;
    }
}

export default UidUtil;
