class ModalUtil {
    static modalDrag($this) {

        /* 输入框 autocomplete=off 以免双击显示历史信息 */
        $this.find('input').attr('autocomplete', 'off');

        const $head = $this.find('.modal-header');
        const $modelContent = $this.find('.modal-content');
        const move = {
            isMove: false,
            left: 0,
            top: 0
        };

        $this.on('mousemove', function(e){
            if(!move.isMove) {
                return;
            }
            $modelContent.offset({
                top: e.pageY - move.top,
                left: e.pageX - move.left
            });
        }).on('mouseup', function(){
            move.isMove = false;
        });
        $head.on('mousedown', function(e){
            move.isMove = true;
            const offset = $modelContent.offset();
            move.left = e.pageX - offset.left;
            move.top = e.pageY - offset.top;
        });
    }

    static modalCenter($this) {
        $this.css('display', 'block');
        const modalLeft = $(window).width() * 0.5 - $('#sys-main-mode-tabs .modal-content').width() * 0.5;
        $this.find('.modal-content').css({
            'left': modalLeft
        });
    }
}

export default ModalUtil;
