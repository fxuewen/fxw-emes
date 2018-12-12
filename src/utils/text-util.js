class TextUtil {
    static getTextWidth(text) {
        const span = document.createElement('span');
        const result = {};
        result.width = span.offsetWidth;
        span.style.visibility = 'hidden';
        document.body.appendChild(span);
        if (typeof span.textContent != 'undefined') {
            span.textContent = text;
        } else {
            span.innerText = text;
        }
        result.width = span.offsetWidth - result.width;
        span.parentNode.removeChild(span);
        return result;
    }
}

export default TextUtil;
