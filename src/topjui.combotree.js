(function ($) {

    $.fn.iCombotree = function (options) {

        var defaults = {
            combotreeId: this.selector,
            url: ctx + '/system/codeItem/getListByCodesetidAndLevelid?codeSetId={codeSetId}&levelId={levelId}',
            expandUrl: ctx + '/system/codeItem/getListByPid?pid={pid}',
            getFatherIdsUrl: '',
            width: 153,
            required: false,
            lines: true,
            multiple: false,
            checkbox: true,
            onlyLeafCheck: false,
            editable: false,
            readonly: false,
            animate: true,
            expandAll: false,
            onBeforeSelect: function (node) {
                if (options.onlyLeafCheck) {
                    // 判断是否是叶子节点
                    var isLeaf = $(this).tree('isLeaf', node.target);
                    if (!isLeaf) {
                        $.messager.alert('提示操作！', '请展开选择子节点！', 'warning');
                        // 返回false表示取消本次选择操作
                        return false;
                    }
                }
            }
        }

        var options = $.extend(defaults, options);

        if (options.url.indexOf("codeSetId") == -1) {
            if (options.url.indexOf("?") == -1) {
                options.url = options.url + "?codeSetId=" + options.codeSetId + "&levelId=" + options.levelId;
            } else {
                options.url = options.url + "&codeSetId=" + options.codeSetId + "&levelId=" + options.levelId;
            }
        } else {
            options.url = options.url.replace("{codeSetId}", options.codeSetId).replace("{levelId}", options.levelId);
        }

        if (options.combotreeId == "") {
            options.combotreeId = $(this).context;
        }

        $combotreeObj = $(this);

        $combotreeObj.combotree({
            url: options.url,
            width: options.width,
            required: options.required,
            lines: options.lines,
            multiple: options.multiple,
            checkbox: options.checkbox,
            onlyLeafCheck: options.onlyLeafCheck,
            editable: options.editable,
            readonly: options.readonly,
            animate: options.animate,
            onBeforeExpand: function (node, param) {
                $(this).tree('options').url = replaceUrlParamValueByBrace(options.expandUrl, node);
            },
            onBeforeSelect: options.onBeforeSelect,
            onLoadSuccess: function (node, data) {
                if (options.expandAll) {
                    var treeObj = $(options.combotreeId).combotree('tree');
                    $(options.combotreeId).combotree('tree').tree("expandAll");
                    // 展开根节点
                    $(options.combotreeId).combotree('tree').tree("expand", $(options.combotreeId).combotree('tree').tree('getRoot').target);
                }

                //setInterval(resetCombotree, 1000);
                if(options.getFatherIdsUrl) {
                    setTimeout(function () {
                        var t = $(options.combotreeId).combotree('tree');
                        var n = t.tree('getSelected');
                        var dataObj = {id: $(options.combotreeId).combotree("getValue")};
                        if (n == undefined && dataObj.id != "") {
                            var findNode;
                            $.ajax({
                                type: "POST",
                                url: replaceUrlParamValueByBrace(options.getFatherIdsUrl, dataObj),
                                //data : {"codeSetId":options.codeSetId, "id":id, "levelId":0},
                                success: function (data) {
                                    $(options.combotreeId).combotree('tree').tree("collapseAll");
                                    var fatherIdsArray = data.split(",");
                                    for (i = 0; i < fatherIdsArray.length; i++) {
                                        findNode = $(options.combotreeId).combotree('tree').tree('find', fatherIdsArray[i]);
                                        if (findNode) {
                                            $(options.combotreeId).combotree('tree').tree('expand', findNode.target);
                                        }
                                    }
                                }
                            });
                            $(options.combotreeId).combotree('setValue', dataObj.id);//数据加载完毕可以设置值了
                        }
                    }, 1000);
                }
            },
            onSelect: function (node) {
                /*if (options.param) {
                    var dialogIdArr = options.dialog.id.split(",");
                    for (var i = 0; i < dialogIdArr.length; i++) {
                        var jsonData = getSelectedRowJson(options.param, node);
                        getTabWindow().$("#" + dialogIdArr[i]).form('load', jsonData);
                    }
                }*/
                if (options.param) {
                    var $formObj = $combotreeObj.closest('form');
                    var jsonData = getSelectedRowJson(options.param, node);
                    getTabWindow().$("#"+ $formObj.attr("id")).form('load', jsonData);
                }
            },
            onShowPanel: function () {
                /*$(options.combotreeId).combotree('tree').tree("collapseAll");
                 var currentNode = $(options.combotreeId).combotree('tree').tree("getSelected");
                 if(currentNode) {
                 $(options.combotreeId).combotree('tree').tree("expandTo", currentNode.target);
                 }*/
            },
            onChange: options.onChange
        });

        function resetCombotree() {
            var t = $(options.combotreeId).combotree('tree');
            var n = t.tree('getSelected');
            var id = $(options.combotreeId).combotree("getValue");
            if (n == undefined && id != "") {
                var findNode;
                $.ajax({
                    type: "POST",
                    url: ctx + "/system/codeItem/getFatherIds",
                    data: {"codeSetId": options.codeSetId, "id": id, "levelId": 0},
                    success: function (data) {
                        $(options.combotreeId).combotree('tree').tree("collapseAll");
                        var fatherIdsArray = data.split(",");
                        for (i = 0; i < fatherIdsArray.length; i++) {
                            findNode = $(options.combotreeId).combotree('tree').tree('find', fatherIdsArray[i]);
                            if (findNode) {
                                $(options.combotreeId).combotree('tree').tree('expand', findNode.target);
                            }
                        }
                    }
                });
                $(options.combotreeId).combotree('setValue', id);//数据加载完毕可以设置值了
            }

        }

    }

})(jQuery);