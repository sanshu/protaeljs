Snap.plugin(function(Snap, Element, Paper, glob) {
    "use strict";
    var e = Element.prototype;
    e.toFront = function() {
        return this.appendTo(this.paper);
    };
    e.toBack = function() {
        return this.prependTo(this.paper);
    };
    e.hide = function() {
        return this.attr({
            'visibility': 'hidden'
        });
    };
    e.show = function() {
        return this.attr({
            'visibility': 'visible'
        });
    };
});

var Protael = (function() {
    "use strict";
    Protael.version = "0.1.0";
    var iniWidth, //initial requested width
        uiOptions = {
            mainSeqHeight: 55,
            featureHeight: 15, // height of the feature track
            graphHeight: 50,
            space: 20
        },
    ColoringSchemes = (function() {
        // see http://www.bioinformatics.nl/~berndb/aacolour.html
        var schema = {
            'clustal': {
                "G": 'orange',
                "P": 'orange',
                "S": 'orange',
                "T": 'orange',
                'H': 'red',
                'K': 'red',
                'R': 'red',
                'F': 'blue',
                'W': 'blue',
                'Y': 'blue',
                'I': 'green',
                'L': 'green',
                'M': 'green',
                'V': 'green'
            },
            'lesk': {
                // Small nonpolar
                'G': 'orange',
                'A': 'orange',
                'S': 'orange',
                'T': 'orange',
                // Hydrophobic
                'C': 'green',
                'V': 'green',
                'I': 'green',
                'L': 'green',
                'P': 'green',
                'F': 'green',
                'Y': 'green',
                'M': 'green',
                'W': 'green',
                // Polar
                'N': 'magenta',
                'Q': 'magenta',
                'H': 'magenta',
                // Negatively charged
                'D': 'red',
                'E': 'red',
                // Positively charged
                'K': 'blue',
                'R': 'blue'
            },
            'maeditor': {
                'A': 'lightgreen',
                'G': 'lightgreen',
                'C': 'green',
                'D': 'DarkGreen',
                'E': 'DarkGreen ',
                'N': 'DarkGreen ',
                'Q': 'DarkGreen ',
                'I': 'blue',
                'L': 'blue',
                'M': 'blue',
                'V': 'blue',
                'F': '#C8A2C8',
                'W': '#C8A2C8',
                'Y': '#C8A2C8', // lilac
                'H': 'DarkBlue ',
                'K': 'orange',
                'R': 'orange',
                'P': 'pink',
                'S': 'red',
                'T': 'red'

            },
            'cinema': {
                // Polar positive
                'H': 'blue',
                'K': 'blue',
                'R': 'blue',
                // Polar negative
                'D': 'red',
                'E': 'red',
                // Polar neutral
                'S': 'green',
                'T': 'green',
                'N': 'green',
                'Q': 'green',
                // Non - polar aliphatic
                'A': 'white',
                'V': 'white',
                'L': 'white',
                'I': 'white',
                'M': 'white',
                // Non - polar aromatic
                'F': 'magenta',
                'W': 'magenta',
                Y: 'magenta',
                'P': 'brown',
                'G': 'brown',
                'C': 'yellow',
                // Special characters
                'B': 'grey',
                'Z': 'grey',
                'X': 'grey'
            },
            'ali': {
                'A': 'grey',
                'R': 'grey',
                'N': 'grey',
                'D': 'grey',
                'C': 'grey',
                'E': 'grey',
                'Q': 'grey',
                'G': 'grey',
                'H': 'grey',
                'I': 'grey',
                'L': 'grey',
                'K': 'grey',
                'M': 'grey',
                'F': 'grey',
                'P': 'grey',
                'S': 'grey',
                'T': 'grey',
                'W': 'grey',
                'Y': 'grey',
                'V': 'grey'
            }
        };
        function getCSchema(colorscheme) {
            colorscheme = colorscheme.toLowerCase();
            return schema[colorscheme] || schema.clustal;
        }

        return {getCSchema: getCSchema};
    }());

    /**
     * Create toolbar
     * @param {Protael} r - Protael object to hook up events
     * @param {Element} toolbar - toolbar div
     * @param {Boolean} showControls - whether or not toolbar should be visible
     */
    function createToolbarBtns(r, toolbar, showControls) {
        toolbar.a = toolbar.append;
        toolbar.a('Zoom:');
        toolbar.a($(
            '<div class="protael_zoomslider"></div>')
            .slider({
                value: r.currentScale(),
                min: .5,
                max: 15,
                step: .05,
                slide: function(event, ui) {
                    r.setZoom(ui.value);
                }
            }));
        toolbar.a($('<button>Zoom to fit</button>').button({
            text: false,
            icons: {
                primary: "ui-icon ui-icon-arrow-4-diag"
            }
        }).click(function() {
            r.zoomToFit();
        }));
        toolbar.a($('<button>Zoom to selection</button>').button({
            text: false,
            icons: {
                primary: "ui-icon ui-icon-arrowthick-2-e-w"
            }
        }).click(function() {
            r.zoomToSelection();
        }));
        toolbar.a('Current selection: <input type="text" class="protael_selection_inp" readonly/>');
        toolbar.a($('<button id="export">Export</button>').button({
            text: false,
            icons: {
                primary: "ui-icon-disk"
            }
        }).click(function() {
            $("#xarea").text(r.getConstruct());
            $("#xdialog").dialog("open");
        }));

        $("#xdialog").dialog({
            modal: true,
            autoOpen: false,
            buttons: {
                Ok: function() {
                    $(this).dialog("close");
                }
            }
        });
        toolbar.a($('<button>Reset selection</button>').button({
            text: false,
            icons: {
                primary: "ui-icon-refresh"
            }
        }).click(function() {
            r.clearSelection();
        }));
        toolbar.a('Coloring:');
        toolbar.a($(
            '<select><option>Original</option><option>Clustal</option><option>Lesk</option><option>Cinema</option><option>MAEditor</option><option>ALI</option><option>None</option></select>')
            .change(function() {
                r.setColoringScheme($(this).val());
            }));
        if (!showControls)
            toolbar.hide();

        $(document).tooltip({
            track: true,
            content: function() {
                var element = $(this);
                if (element.is("[data-pdb]")) {
                    var text = element.data("pdb");
                    return '<img src="http://www.rcsb.org/pdb/images/' + text + '_bio_r_250.jpg">';
                } else if (element.is("[title]")) {
                    return element.attr("title");
                } else if (element.is("img")) {
                    return element.attr("alt");
                }
            }
        });
        toolbar.a($(
            '<input type="checkbox" id="chkTooltip" checked="true"><label for="chkTooltip">Cursor tooltips</label>')
            .change(
                function() {
                    r.setShowCursorTooltips($("#chkTooltip").is(':checked'));
                }));
        // toolbar.append('ScreenX: <input type="text" id="sx_inp" readonly/>');
        // toolbar.append('RealX: <input type="text" id="rx_inp" readonly/>');
    }

    function Protael(protein, container, width, height, controls) {
        if (!(this instanceof  Protael)) {
            return new Protael(protein, container, width, height, controls);
        }
        //create dom structure; this is ugly, i know
        var browser = navigator.appVersion,
            self = this,
            s = '<div class="ui-widget-content protael_resizable" style="width:'
            + width + '; height:' + height + '" ></div>',
            newDiv = $(s),
            toolbar = $('<div class="ui-widget-header ui-corner-all protael_toolbar"></div>'),
            svgString = '<div width="100%" height="100%" class="protael_svg">' +
            '<div><div class="protael_slider"></div></div>' +
            '<svg id="' + container + '_svgcanvas" width="100%" height="100%" preserveAspectRatio="xMinYMin meet">'
            + '<desc>Protael ' + Protael.version + '</desc>'
            + '</svg></div>',
            svg = $(svgString)
            ;
        $('#' + container).append(newDiv);

        this.container = container;
        newDiv.append(toolbar);
        newDiv.append(svg);
        this.protein = protein;
        iniWidth = svg.width();
        this.controlsEnabled = controls;

        if (this.controlsEnabled) {
            $('#' + this.container + ' .protael_slider').slider({
                range: true,
                min: 1,
                max: protein.sequence.length,
                values: [1, 1],
                slide: function(event, ui) {
                    self.setSelection(ui.values[0], ui.values[1]);
                }
            });
        }
        if (controls) {
            newDiv
                .append('<div id="xdialog" title="Export selection"><textarea id="xarea" cols="40" rows="10"></textarea></div>');
            createToolbarBtns(this, toolbar, controls);
        }
        this.selectedx = [-1, -1];// selection minX-maxX

        this.svgDiv = $('#' + container + ' .protael_svg');

        this.selectSlider = $('#' + container + ' .protael_slider');
        this.selectInput = $('#' + container + " .protael_selection_inp");
        this.isChrome = (browser.indexOf('Chrome') >= 0 || browser
            .indexOf('Opera') >= 0);
        this.currScale = 1;
        this.currShift = 0;
        this.showCursorTooltips = true;
        this.paper = new Paper(container, svg.width(), svg.height(), this);
        this.H = Utils.calcHeight(this.protein);
        this.W = this.protein.sequence.length;
        this.paper.setSize(this.W, this.H);
        this.paper.axis(this.W, 10);

        newDiv.resizable({
            stop: function(ev, ui) {
                self.zoomToFit();
            }
        });
    }
    function Paper(container, w, h, parent) {
        this.protael = parent;
        this.paper = Snap("#" + container + '_svgcanvas');
        this.paper.attr({
            "viewBox": "0 0 " + w + " " + h
        });
        var p = this.paper; //shortcut

        this.viewSet = Snap.set(); // contains all objects for scaling
        this.textSet = Snap.set(); // contains all text elements of the canvas
        this.overlayFtLabels = Snap.set(); // contains labels for overlay features (for
        // switching views on zoomin/out)
        this.createDefs();
//
        //Groups to hold different parts of the plot//
        this.gAxes = p.g().attr({id: "axes"}); // axes and lanels
        this.gSequences = p.g().attr({Id: "seqs"}); // sequence chars and backgrounds
        this.gFTracks = p.g().attr({id: "ftracks"}); // feature tracks
        this.gQTracks = p.g().attr({Id: "qtracks"}); // quantitative tracks
        this.seqChars = p.g().attr({
            id: "seqChars",
            'font-family': 'monospace',
            'font-size': "9px",
            "text-anchor": "start",
            "letter-spacing": '0px'
        });
        this.seqLines = p.g().attr({id: "seqLines"});
        this.seqLineCovers = p.g().attr({
            id: "seqLineCovers",
            opacity: 0
        });
        this.seqBGSet = p.g().attr({
            id: "seqBGSet",
            opacity: 0.7
        });
        this.seqLabelsSet = p.g().attr({
            "font-size": "9px",
            "text-anchor": "start",
            id: "seqLabels"
        });
    }

    (function(paperproto) {
        paperproto.setSize = function(w, h) {
            var p = this.paper, vb = p.attr("viewBox"),
                hh = ''.concat(h).concat('px');
            vb.height = h;
            p.attr({
                height: hh,
                width: w,
                viewBox: vb
            });
        };
        paperproto.getWidth = function() {
            return this.paper.attr("width");
        };
        /**
         *
         * @param {type} zoom - requested zoom
         * @returns {undefined}
         */
        paperproto.setZoom = function(zoom) {
            var p = this.protael,
                ds = zoom / p.currScale,
                w = this.getWidth();

            if (w.indexOf('px') > 0) {
                w = w.replace(/[^\d.-]/g, '');
            }

            var newWidth = Math.round(w * ds);
            this.setWidth(newWidth);

            this.viewSet.forEach(function(t) {
                var x = t.attr("x"), w = t.attr("width");
                if (x) {
                    t.attr({x: x * ds});
                } else {
                    // we have lines and paths here
                    if (t.type === "line") {
                        var x1 = t.attr("x1"), x2 = t.attr("x2");
                        t.attr({
                            x1: x1 * ds,
                            x2: x2 * ds
                        });
                    } else if (t.type === "path") {
                        t.transform("s" + zoom + " 1 0 0");
                    } else {
                    }
                }
                if (w && !isNaN(w))
                    t.attr({
                        width: w * ds
                    });
            });
            this.textSet.forEach(function(t) {
                var x = t.attr("x");
                if (x) {
                    // just text
                    t.attr({
                        x: x * ds
                    });
                } else {
                    // underline of bridge
                    // if (t.type === "line") {
                    // var x1 = t.attr("x1"), x2 = t.attr("x2");
                    // var l = x2 - x1;
                    // var xx = x1 * ds;
                    // t.attr({
                    // x1 :xx,
                    // x2 : xx + l
                    // });
                    // }
                }
            });
            // ///////////////////
            // works in Chrome only
            if (this.isChrome) {
                var sseq = this.strechSeq
                sseq.attr({
                    "letter-spacing": "0px"
                }).hide();
                var unstrW = sseq.getBBox().width,
                    deltaW = newWidth - unstrW,
                    sl = sseq.attr("numspaces"),
                    newspa = deltaW / sl + "px",
                    x = sseq.attr("x");
                sseq.attr({
                    x: x * ds,
                    'letter-spacing': newspa
                });
                this.seqChars.attr({
                    'letter-spacing': newspa
                });
            }
            // //////////////////
            // var sx = seqBGSet.transform().localMatrix.split().scalex * ds;
            // seqBGSet.transform("S" + zoom + " 1 0 0");

            p.currScale = zoom;
            p.currScale > 1 ? this.seqBGSet.show() : this.seqBGSet.hide();
            p.currScale > 7 ? this.seqChars.show() : this.seqChars.hide();
            p.currScale > 7 ? this.overlayFtLabels.forEach(function(t) {
                t.hide();
            }) : this.overlayFtLabels.forEach(function(t) {
                t.show();
            });
        }
        ;
        paperproto.axis = function(w, dx) {
            var i, maxI = w / dx + 1,
                l, t,
                H = this.protael.H,
                p = this.paper,
                axesLabels = p.g().attr({
                id: "axLbls",
                'class': "pl-axeslbl"
            });
            for (i = 0; i <= maxI; i++) {
                l = p.line(Math.round(i * dx), 0, Math.round(i * dx), H);
                if (i % 5 === 0) {
                    l.attr({'class': 'major'});
                    t = p.text(i * dx, 8, i * dx);
                    this.textSet.push(t);
                    axesLabels.add(t);
                } else {
                    l.attr({'class': 'minor'});
                }
                this.gAxes.add(l);
                this.viewSet.push(l);
            }

            this.gAxes.add(axesLabels);
            return this.gAxes;
        };
        paperproto.createDefs = function() {
            var p = this.paper, dx = 5, dy = 8, y = 38,
                thegap = p.g().attr({
                id: "gap",
                "stroke-width": 2
            }),
                s = "m 9.943742,1.54515 0,7.665216 C 9,15 8.977801,15 6,18 5.092011,19.329493 0.900884,20.578894 0,22 -0.903141,20.578894 -4.252632,19.379901 -5.160607,18.050408 -7.745849,14.487355 -9.7582132,11.922758 -9.6863207,9.212778 l 0,-7.667628 -5.7594933,0 0,7.665216 c 0.07412,5.544348 3.171965,8.901205 5.6876008,12.525256 2.6545072,3.598566 6.1354302,5.259308 6.0060532,7.136425 L -3.75216,38 4,38 4,28.866878 c -0.129374,-1.874375 3.351556,-3.535283 6.006045,-7.133892 2.518073,-3.62402 5.613376,-6.978272 5.687696,-12.52262 l 0,-7.665216 z";
            p.path(s).attr({
                id: "glycan",
                fill: "#000"
            }).transform("scale(0.3)").toDefs();
            s = "m 9.943742,1.54515 0,7.665216 c 0.01858,0.678098 -1.8182777,4.537747 -2.31158,4.024493 L -1.548312,3.388971 -5,6.5 6.022199,18 C 5.11421,19.329493 2.03074,20.719454 1.129856,22.14056 0.226715,20.719454 -4.252632,19.379901 -5.160607,18.050408 -7.745849,14.487355 -9.7582132,11.922758 -9.6863207,9.212778 l 0,-7.667628 -5.7594933,0 0,7.665216 c 0.07412,5.544348 3.171965,8.901205 5.6876008,12.525256 2.6545072,3.598566 6.1354302,5.259308 6.0060532,7.136425 L -3.75216,38 4,38 4,28.866878 c -0.129374,-1.874375 3.351556,-3.535283 6.006045,-7.133892 2.518073,-3.62402 5.613376,-6.978272 5.687696,-12.52262 l 0,-7.665216 z";
            p.path(s).attr({
                id: "oliglycan"
            }).transform("scale(0.3)").toDefs();
            s = "M 9.943742,1.54515 5.757162,5.359859 4,1.625 l -7,0 -2.311321,3.712778 -4.3749997,-3.792628 -5.7594933,0 5.6876008,8.190472 c 2.6545072,3.598566 6.1354302,1.259308 6.0060532,3.136425 L -3.75216,38 4,38 4,12.866878 C 4,11 7.351556,13.331595 10.006045,9.732986 L 15.693741,1.54515 z";
            p.path(s).attr({
                id: "unknownglycan"
            }).transform("scale(0.3) ").toDefs();
            p.line(0, 0, 0, 12).attr({
                id: "stick",
                "stroke-width": 2
            }).toDefs();
            thegap.add(p.line(0, dy, 0, y - dy));
            thegap.add(p.line(-dx, 0, 0, dy));
            thegap.add(p.line(dx, 0, 0, dy));
            thegap.add(p.line(-dx, y, 0, y - dy));
            thegap.add(p.line(dx, y, 0, y - dy));
            thegap.toDefs();
        };
        paperproto.createUse = function(defid, x, y, attrs) {
            var el = this.paper.el("use").attr({
                x: x - 0.5,
                y: y,
                "xlink:href": "#" + defid
            }).attr(attrs);
            this.viewSet.push(el);
            return el;
        };
        paperproto.setWidth = function(width) {
            var ww, vb = this.paper.attr("viewBox");
            vb.width = width + 20;
            ww = ''.concat(width).concat('px');
            this.paper.attr({
                "width": ww,
                "viewBox": vb
            });
            if (this.protael.selectSlider.length) {
                this.protael.selectSlider.width(ww);
            }
        };
        paperproto.proteinSeqBG = function(chars, scolors, yy, showSequence, offset, label) {
            offset = offset * 1 - 1 || 0;
            var inst = this.protael,
                self = this,
                paper = this.paper,
                white = 'white';
            setTimeout(
                function() {
                    //    var group = paper.select ("#seq_"+label);
                    var scale = inst.currentScale() || 1,
                        h = showSequence ? 9 : 3,
                        color = white,
                        prevColor = color,
                        // start and end of the rectangle
                        start = 1,
                        allrects = [], c,
                        length = chars.length,
                        r,
                        y = yy;
                    for (c = 0; c < length; c++) {
                        color = scolors[c] || white;
                        if (prevColor !== color) {
                            if (prevColor !== white) {
                                r = paper.rect((start + offset) * scale, y,
                                    (c - start) * scale, h).attr({
                                    fill: prevColor,
                                    stroke: prevColor
                                });
                                // }
                                allrects.push(r);
                                self.viewSet.push(r);
                                // group.add(r);
                            }
                            start = c;
                            prevColor = color;
                        }
                    }
                    // last rect
                    if (prevColor !== white) {
                        r = paper.rect((start + offset) * scale, y,
                            (c - start) * scale, h).attr({
                            fill: prevColor,
                            stroke: prevColor
                        });
                        allrects.push(r);
                        self.viewSet.push(r);
                        //       group.add(r);
                    }

                    self.seqBGSet.add(allrects);
                }, 10);
        };

        paperproto.proteinSequence = function(chars, y, showSequence, alignment) {
            alignment = alignment || {};
            y = y || 10;

            var p = this.paper,
                self = this,
                label = alignment.description,
                sequenceGroup = p.g().attr({id: "SG_" + label, "title": label || ''}),
                startX = alignment.start - 1 || 0,
                inst = this.protael,
                h = showSequence ? 15 : 3,
                line = p.line(0, (y + h / 2), this.protael.W, (y + h / 2))
                .attr({'class': "pl-seqline"}),
                rect = p.rect(0, y, this.protael.W, 10).attr({"id": "seq_" + label, "title": label || '', opacity: 0}),
                l = chars.length,
                unstrW;
            sequenceGroup.add(rect, line);

            if (alignment.clazz) {
                rect.attr({"class": alignment.clazz});
            }

            if (alignment.pdbid) {
                rect.attr({"data-pdb": alignment.pdbid});
            }

            this.seqLineCovers.add(rect);
            this.seqLines.add(line);
            this.viewSet.push(line, rect);

            if (showSequence) {
                // TODO: hmmm.... i have a bad feeling about this. will it use only main seq?
                if (this.isChrome) {
                    this.strechSeq = this.paper.text(startX * inst.currentScale(), y + 8,
                        chars.join(''));
                    unstrW = this.strechSeq.getBBox().width;
                    this.strechSeq.attr({
                        'uwidth': unstrW,
                        'numspaces': chars.length
                    });
                    this.textSet.push(this.strechSeq);
                    this.seqChars.add(this.strechSeq);
                }
                else {
                    setTimeout(function() {
                        if (showSequence) {
                            var allchars = [], c, x, chr;
                            for (c = 0; c < l; c++) {
                                if (chars[c] !== '.') {
                                    x = (startX + c) * inst.currentScale();
                                    chr = p.text(x, y + 8, chars[c]);
                                    allchars.push(chr);
                                    self.textSet.push(chr);
                                }
                            }
                            self.seqChars.add(allchars);
                        }
                        // if (label)
                        // seqLabelsSet.add(paper.text(1, y + 5, label));
                    }, 10);
                }
            }
        };

        paperproto.clearColoring = function() {
            //TODO: use forEach()
            for (var c in this.seqBGSet)
                this.viewSet.exclude(this.seqBGSet[c]);
            this.seqBGSet.clear();
        };

        paperproto.setColoringScheme = function(CS) {
            this.clearColoring();
            if (CS.toLowerCase() === 'none') {
                return;
            }

            var topY = this.aliTop,
                protein = this.protael.protein,
                show = protein.alidisplay ? true : false, // show MAS letters?
                scolors = [],
                data,
                chars = protein.sequence.toUpperCase().split(''),
                gutter = 35,
                i, j, maxJ, c, maxC,
                ali;

            if (CS.toLowerCase() === 'original') {
                // restore original coloring
                if (protein.seqcolors) {
                    data = Utils.splitData(protein.seqcolors.data.toUpperCase());
                    for (c = chars.length; c--; ) {
                        scolors[c] = protein.seqcolors.colors[data[c]];
                    }
                } else {
                    this.setColoringScheme("none");
                }

                this.proteinSeqBG(chars, scolors, gutter, true);

                if (protein.alignments) {
                    for (j = 0, maxJ = protein.alignments.length; j < maxJ; j++) {
                        ali = protein.alignments[j];
                        scolors = [];
                        chars = ali.sequence.split('');
                        if (ali.color) {
                            // USE SINGLE INSTANCE COLOR
                            for (c = chars.length; c--; ) {
                                scolors[c] = ali.color;
                            }
                        } else if (ali.seqcolors) {
                            data = Utils.splitData(ali.seqcolors.data.toUpperCase());
                            if (ali.seqcolors.colors) {
                                // USE instance colors

                                for (c = chars.length; c--; ) {
                                    scolors[c] = ali.seqcolors.colors[data[c]];
                                }
                            } else if (protein.seqcolors.colors) {
                                // use protein

                                for (c = chars.length; c--; ) {
                                    scolors[c] = protein.seqcolors.colors[data[c]];
                                }
                            }
                        } else {
                            // use main colors
                            scolors = Utils.getColors(chars, ColoringSchemes.getCSchema(ali.CS || 'ALI'));
                        }
                        this.proteinSeqBG(chars, scolors, topY, show,
                            ali.start || 0, ali.label);
                        topY += 10;
                        if (protein.alidisplay)
                            topY += 5;
                    }
                }
            } else {
                var schema = ColoringSchemes.getCSchema(CS);
                scolors = Utils.getColors(chars, schema);
                this.proteinSeqBG(chars, scolors, gutter, true);
                if (protein.alignments)
                    for (var j in protein.alignments) {
                        chars = protein.alignments[j].sequence.split(''),
                            scolors = Utils.getColors(chars, schema);
                        this.proteinSeqBG(chars, scolors, topY, show,
                            protein.alignments[j].start || 0);
                        topY += 10;
                        if (protein.alidisplay)
                            topY += 5;
                    }
            }
        };

        paperproto.featureTrack = function(ftrack, topY, height, allowOverlaps, showLabels, isOverlay) {
            //   console.log("Drawing ftrack: " + ftrack.label);
            var paper = this.paper,
                clazz = 'pl-ftrack ' + (ftrack.clazz || ""),
                g = paper.g().attr({
                id: ftrack.label,
                'class': clazz,
                'font-size': (height - 8) + "px"
            }),
                display = ftrack.display || 'block',
                color = ftrack.color || '',
                seenDeltas = [],
                lastLevel = 0,
                ft, delta,
                f, maxF = ftrack.features.length;

            this.gFTracks.add(g);
            seenDeltas.push(0);

            if (allowOverlaps) {
                for (f = 0; f < maxF; f++) {
                    ft = ftrack.features[f];
                    if (ft) {
                        featureGroup = this.feature(ft, ft.color || color, display,
                            topY, height, g, showLabels, allowOverlaps, isOverlay);
                        if (ft.click) {
                            featureGroup.click(ft.click(ft.dbxrefs));
                        }
                    }
                }
            }
            else {
                ftrack.features.sort(function(a, b) {
                    return a.start - b.start;
                });
                var arrcopy = JSON.parse(JSON.stringify(ftrack.features)),
                    lastX = 0;
                while (arrcopy.length > 0) {
                    ft = arrcopy.shift();
                    if (ft) {
                        delta = 0;
                        ft.draw_level = ft.draw_level || 0;
                        delta = ft.draw_level * height;
                        if ($.inArray(delta, seenDeltas) === -1)
                            seenDeltas.push(delta);
                        if (ft.draw_level !== lastLevel)
                            lastX = 0;
                        if (ft.start >= lastX) {
                            var featureGroup = this.feature(ft, ft.color || color,
                                display, topY + delta, height, g, true, allowOverlaps, isOverlay);
                            if (ft.click) {
                                featureGroup.click(ft.click);
                            }

                            lastX = ft.end;
                            lastLevel = ft.draw_level;
                        } else {
                            ft.draw_level++;
                            arrcopy.push(ft);
                        }
                    }
                }
            }

            if (ftrack.showLine) {
                var d = (display === 'block') ? 0 : -height / 2 + 2,
                    yy = 0 + topY + height / 2 - d;
                for (var delta in  seenDeltas) {
                    var dd = seenDeltas[delta],
                        line = paper.line(0, yy + dd, this.protael.W, yy + dd).attr({
                        stroke: '#BBB',
                        fill: "#BBB",
                        "stroke-width": "1px",
                        title: ftrack.label || ''
                    }).toBack();
                    g.prepend(line);
                    this.viewSet.push(line);
                }
            }

            return lastLevel;
        };
        paperproto.feature = function(feature, color, display, topY, height, g, showLabel, allowOverlaps, isOverlay) {
            var s = feature.start - 1,
                e = feature.end,
                shapeGr,
                shape,
                label,
                clazz = 'pl-feature',
                paper = this.paper;
            //      console.log("\tDrawing feature: " + feature.label);
            if (display === 'block') {
                shape = paper.rect(s, topY, e - s, height).attr({
                    // stroke: "#bbb"
                });
            } else if (display === 'line') {
                shape = paper.rect(s, topY + height / 2 + 4, e - s, 3);
            }

            if (color) {
                shape.attr({fill: color});
            }
            if (allowOverlaps) {
                shape.attr({opacity: .6});
            }
            if (feature.clazz) {
                clazz += ' ' + feature.clazz;
                shape.attr({'class': feature.clazz});
            }
            shapeGr = paper.g().attr({
                id: feature.label || '',
                title: feature.label,
                fill: color,
                'class': clazz
            });

            shapeGr.add(shape);
            if (showLabel) {
                label = paper.text((s + e) / 2, topY + height - 5,
                    feature.label);
                label.attr({stroke: 'none', 'class': 'pl-feature-label'});
                shapeGr.append(label);
                this.textSet.push(label);
                if (isOverlay) {
                    this.overlayFtLabels.push(label);
                }
            }
            g.add(shapeGr);
            this.viewSet.push(shape);
            return shapeGr;
        };
        // from g.raphael linechart
        function getAnchors(p1x, p1y, p2x, p2y, p3x, p3y) {
            var l1 = (p2x - p1x) / 2, l2 = (p3x - p2x) / 2, a = Math
                .atan((p2x - p1x) / Math.abs(p2y - p1y)), b = Math
                .atan((p3x - p2x) / Math.abs(p2y - p3y));
            a = p1y < p2y ? Math.PI - a : a;
            b = p3y < p2y ? Math.PI - b : b;
            var alpha = Math.PI / 2 - ((a + b) % (Math.PI * 2)) / 2, dx1 = l1
                * Math.sin(alpha + a), dy1 = l1 * Math.cos(alpha + a), dx2 = l2
                * Math.sin(alpha + b), dy2 = l2 * Math.cos(alpha + b);
            return {
                x1: p2x - dx1,
                y1: p2y + dy1,
                x2: p2x + dx2,
                y2: p2y + dy2
            };
        }

        paperproto.quantTrack = function(qtrack, topY, width, height) {
            //    console.log("Drawing qtrack: " + qtrack.values);
            var //x = [],
                i, j, jj,
                c = qtrack.color || "#F00",
                fill = c,
                max = Math.max.apply(Math, qtrack.values),
                min = Math.min.apply(Math, qtrack.values),
                zero = (-min) / (max - min) * 100,
                path = '',
                ky = height / (max - min),
                y = topY,
                smooth = false,
                X, Y, W = this.protael.W,
                paper = this.paper;
//            console.log(max);
//            console.log(min);
            for (i = qtrack.values.length; i <= width; i++) {
                qtrack.values[i] = 0;
            }

            //TODO: use only one property instead of two
            if (!qtrack.values && qtrack.data) {
                qtrack.values = (qtrack.data.indexOf(',') > 0) ? qtrack.data
                    .split(',') : qtrack.data.split('');
            }

            qtrack.values.splice(0, 0, 0);

            qtrack.values[width] = 0;
            if (smooth) {
                for (j = 0, jj = W; j < jj; j++) {
                    X = j;
                    Y = y + height - qtrack.values[j] * ky;
                    if (j && j !== jj - 1) {
                        var X0 = (j - 1),
                            Y0 = y + height - qtrack.values[j - 1] * ky,
                            X2 = (j + 1),
                            Y2 = y + height - qtrack.values[j + 1] * ky,
                            a = getAnchors(X0, Y0, X, Y, X2, Y2);
                        path = path + 'C'
                            + ([a.x1, a.y1, X, Y, a.x2, a.y2]).join(',');
                    }

                    if (!j) {
                        path = path + "M0 " + (topY + height) + " C" + X + ' ' + Y;
                    }
                }
            }
            else {
                for (j = 0; j < W; j++) {
                    X = j;
                    Y = y + height - (qtrack.values[j] - min) * ky;
                    if (j && j !== jj - 1) {
                        path = path + "L" + X + ", " + Y;
                    }
                    if (!j) {
                        path = path + "M0 " + (topY + height + min * ky);
                    }
                }
            }

            if (Array.isArray(c)) {
                if (c.length == 1)
                {
                    fill = c[0];
                } else if (c.length == 2) {
                    fill = paper.gradient("l(0, 1, 0, 0)" + c[0] + '-' + c[1]);
                }
                else if (c.length == 3) {

                    fill = paper.gradient("l(0, 1, 0, 0)" + c[0] + '-' + c[1] + ":" + zero + '-' + c[2]);
                }
            }

            path = path + 'L' + (W) + ' ' + (topY + height + min * ky) + " Z";
            var chart2 = paper.path(path).attr({
                stroke: c,
                "stroke-width": 0.1,
                "stroke-linejoin": "round",
                "stroke-linecap": "butt",
                "stroke-dasharray": "",
                fill: fill,
                opacity: ".7"
            }),
                label = paper.text(.1, topY + 8, qtrack.label).attr({
                "font-size": "10px",
                "text-anchor": "start"
            }),
                topLine = paper.line(0, topY, W, topY).attr({"class": "pl-chart-top"}),
                cLine = paper.line(0, topY + max * ky, W, topY + max * ky).attr({"class": "pl-chart-center"}),
                bottomLine = paper.line(0, topY + height, W, topY + height).attr({"class": "pl-chart-bottom"}),
                g = paper.g(chart2, topLine, bottomLine, cLine, label).attr({id: "qtrack_" + qtrack.label});
            this.gQTracks.add(g);
            this.viewSet.push(topLine);
            this.viewSet.push(bottomLine);

            this.viewSet.push(cLine);
            this.viewSet.push(chart2);
            this.textSet.push(label);
        };


        paperproto.proteinMarkers = function(markers, topY) {
            var markerGp = this.paper.g().attr({
                id: "gMarkers"
            }),
                i,
                maxI = markers.length,
                m,
                shift,
                type,
                id,
                mark,
                t,
                att = {
                    "font-size": "10px",
                    "font-family": "Arial",
                    "text-anchor": "middle"
                };
            for (i = markers.length; i--; ) {
                m = markers[i];
                shift = (m.position === 'bottom') ? 26 : 0;
                type = m.type ? m.type : "glycan";
                //TODO: add IDs
                id = m.label ? "m_" + m.label : "m_" + i;
                mark = this.createUse(type, m.x, topY + shift, {
                    id: id,
                    title: m.label ? m.label : ""
                });
                if (m.label) {
                    shift = (m.position === 'bottom') ? 45 : 0;
                    t = this.paper.text(m.x, topY + shift, m.label).attr(att);
                    if (m.color)
                        t.attr({
                            fill: m.color
                        });
                    this.textSet.push(t);
                    markerGp.add(t);
                }
                if (m.color)
                    mark.attr({
                        fill: m.color,
                        stroke: m.color
                    });
                markerGp.add(mark);
            }
        }

        paperproto.proteinBridges = function(bridges, topY) {
            var group = this.paper.g().attr({
                id: "gBridges",
                class: "pl-bridge"
            }),
                paper = this.paper,
                bridgeH = 12,
                b, gb,
                att = {}, att2 = {fill: "white", stroke: "white"},
            s, e, c, ls, le,
                lc1, t, lc2;
//TODO: micro-opt
            for (var i in bridges) {
                b = bridges[i];
                gb = paper.g().attr({
                    id: "bridge_" + i
                });
                att = {};
                if (b.color) {
                    att = {
                        fill: b.color,
                        stroke: b.color
                    };
                }
                s = b.start - 0.5;
                e = b.end - 0.5;
                c = (e + s) / 2;
                // start mark
                ls = paper.line(s, topY, s, topY + bridgeH).attr(att);
                this.viewSet.push(ls);
                // end mark
                le = paper.line(e, topY, e, topY + bridgeH).attr(att);
                this.viewSet.push(le);
                // connection lines

                lc1 = paper.line(s, topY + bridgeH, e, topY + bridgeH)
                    .attr(att);
                this.viewSet.push(lc1);
                // add labels
                if (b.startlabel) {
                    t = paper.text(s, topY + 21, b.startlabel);
                    if (b.color)
                        t.attr({
                            fill: b.color
                        });
                    this.textSet.push(t);
                    gb.add(t);
                }
                if (b.endlabel) {
                    var t = paper.text(e, topY + 21, b.endlabel);
                    if (b.color)
                        t.attr({
                            fill: b.color
                        });
                    this.textSet.push(t);
                    gb.add(t);
                }
                gb.add(ls, le, lc1);
                if (b.type) {
                    t = paper.text(c, topY + 15, b.type);
                    var textw = b.type.length;
                    lc2 = paper.line(c - textw / 2 - 1, topY + bridgeH,
                        c + textw / 2 + 1, topY + bridgeH).attr(att2);
                    if (b.color) {
                        t.attr({
                            fill: b.color
                        });
                    }
                    t.toFront();
                    this.textSet.push(t);
                    this.viewSet.push(lc2);
                    gb.add(lc2, t);
                }

                group.add(gb);
            }
        };

        paperproto.draw = function(protein) {
            var scolors = [],
                chars = protein.sequence.toUpperCase().split(''),
                // showAlignments = protein.alidisplay ? true : false, // show MAS letters?
                topY = 35,
                drawingTop = 20,
                paper = this.paper,
                i, counterMax,
                allowOver, delta,
                qtrackLbls = [], qtrackBgs = [];

            if (protein.markers) {
                this.proteinMarkers(protein.markers, drawingTop);
            }

            if (protein.bridges) {
                this.proteinBridges(protein.bridges, topY + 15);
            }

            if (protein.overlayfeatures) {
                var showOLbls = protein.overlayfeatures.showLabels || false;
                this.featureTrack(protein.overlayfeatures, topY - 5, 20, true,
                    showOLbls);
            }
            this.aliTop = topY;
            /*

             if (protein.seqcolors) {
             var data = Utils.splitData(protein.seqcolors.data.toUpperCase()),
             c = chars.length;
             for (c = chars.length; c -= 1;) {
             scolors[c] = protein.seqcolors.colors[data[c]];
             }
             }
             */
            this.proteinSequence(chars, topY, true);
            this.proteinSeqBG(chars, scolors, topY, true, "main");
            // /////////////////
            // this works in Chrome, but not so much in Safari or Firefox,
            // will have to think about it later
            if (this.protael.isChrome) {
                this.strechSeq = this.paper.text(0, 30, protein.sequence).attr({
                    id: "strechSeq",
                    'font-family': 'monospace',
                    'font-size': "9px",
                    "text-anchor": "start",
                    "letter-spacing": "0px"
                }).hide();
                this.strechSeq.attr({
                    'uwidth': this.strechSeq.getBBox().width,
                    'numspaces': chars.length
                });
            }
            // ///////////////////////////

            topY += 30;
            this.gLabels = this.paper.g().attr({
                "font-size": "14px",
                "text-anchor": "start",
                id: "cursor"
            }).hide();
            counterMax = protein.ftracks ? protein.ftracks.length : 0;
            for (i = 0; i < counterMax; i++) {
                allowOver = protein.ftracks[i].allowOverlap || false;
                delta = this.featureTrack(protein.ftracks[i], topY, uiOptions.featureHeight,
                    allowOver, true);
                topY += uiOptions.featureHeight * delta + uiOptions.space;
            }

            counterMax = protein.qtracks ? protein.qtracks.length : 0;

            for (i = 0; i < counterMax; i++) {
                this.quantTrack(protein.qtracks[i], topY, this.protael.W, uiOptions.graphHeight);
                // add tooltip
                var r = paper.rect(0, 16 + topY, 22, 20, 4, 4).attr({
                    fill: "#000",
                    stroke: "black",
                    color: "white",
                    "stroke-width": "2px",
                    opacity: ".7"
                }), l = paper.text(0, 30 + topY, '').attr({
                    fill: "white"
                });
                this.gLabels.add(r, l);
                qtrackLbls[i] = l;
                qtrackBgs[i] = r;
                protein.qtracks[i].topY = topY;
                topY += uiOptions.graphHeight + uiOptions.space;
            }

            this.aliTop = topY;
            var show = protein.alidisplay ? true : false; // show MAS letters?

            if (protein.alignments) {
                this.protael.setColoringScheme("Original");
                counterMax = protein.alignments.length;
                for (i = 0; i < counterMax; i++) {
                    var ali = protein.alignments[i],
                        schars = ali.sequence.split('');

                    this.proteinSequence(schars, topY, show, ali);
                    topY += 10;
                    if (show) {
                        topY += 5;
                    }
                }
            }

            this.gSequences.add(this.seqLabelsSet, this.seqBGSet, this.seqChars, this.seqLines);
            this.labelsWidth = this.seqLabelsSet.getBBox().width;
            this.seqBGSet.hide();
            this.seqChars.hide().transform("T1, 0");
            this.gSequences.toFront();
            this.seqLines.toBack();
            this.gAxes.toBack();
            // rect to show current position
            this.selector = paper.rect(-1, 0, 0, this.protael.H).attr({
                fill: '#DDD',
                stroke: "#666",
                "stroke-width": "2px",
                opacity: .5,
                id: "selector"
            }).hide();

            // rect to show selection

            this.pointer = paper.rect(0, 0, 2, this.protael.H).attr({
                fill: 'green',
                stroke: 'green',
                opacity: .7,
                id: "pointer"
            });
            this.viewSet.push(this.selector);
            var residueBg = paper.rect(0, 46, 22, 20, 4, 4).attr({
                fill: "#000",
                stroke: "black",
                color: "white",
                "stroke-width": "2px",
                opacity: .7
            }), residueLabel = paper.text(0, 60, '').attr({
                fill: "white"
            });
            this.seqLineCovers.toFront();
            var self = this,
                parent = this.protael,
                // and we need a rect for catching mouse event for the whole chart area
                r = paper.rect(0, 0, parent.W, parent.H).toBack().attr({
                stroke: "#fff",
                opacity: 0,
                id: "blanket"
            });
            this.gLabels.add(residueBg, residueLabel);
            paper.mousemove(function(e) {
                e = e || window.event;
                var xoff = e.offsetX,
                    c = this.container + ' #blanket',
                    delta = 5, x;
                if (xoff === undefined) { // Firefox fix
                    var q = $(c);
                    xoff = e.pageX - q.offset().left;
                }

                x = Math.round(xoff + parent.currShift);
                if (x < 0)
                    return;
                self.pointer.attr({
                    'x': x + delta
                }).show();
                if (parent.showCursorTooltips) {
                    var OX = parent.toOriginalX(x);
                    residueLabel.node.textContent = chars[OX] + ": " + (OX + 1);
                    x += delta;
                    self.gLabels.transform("T " + x + " 0").show();
                    var l = residueLabel.getBBox().width;
                    residueBg.attr({
                        width: l
                    });
                    for (var q in protein.qtracks) {
                        var lb = qtrackLbls[q];
                        var r = qtrackBgs[q];
                        lb.node.textContent = protein.qtracks[q].values[OX];
                        var l = lb.getBBox().width;
                        r.attr({
                            width: l
                        });
                    }
                }
            }).mouseout(function() {
                self.gLabels.hide();
                self.pointer.hide();
            });
            this.viewSet.push(r);
        };
    }(Paper.prototype));
    Protael.Paper = Paper;
    Protael.prototype.Utils = {};
    Protael.prototype.Utils.calcHeight = function(protein) {
        var h = uiOptions.mainSeqHeight, // main sequence
            y = 0;
        if (protein.ftracks && protein.ftracks.length) {
            h += uiOptions.featureHeight * (protein.ftracks.length + 2);
        }
        if (protein.qtracks) {
            h += (uiOptions.graphHeight + uiOptions.space) * (protein.qtracks.length);
        }

        if (protein.alignments) {
            y = protein.alidisplay ? 15 : 10;
            h += (y * protein.alignments.length);
        }
        return h + 20;
    };
    /**
     * Splits string data using ',' or into individual residues
     * @param {type} data
     * @returns {array} values
     */
    Protael.prototype.Utils.splitData = function(data) {
        return (data.indexOf(',') > 0) ? data.split(',') : data.split('');
    };
    /**
     * Returns array of colors, one per residue
     * @param {type} chars
     * @param {type} schema
     * @returns {Array}
     */
    Protael.prototype.Utils.getColors = function(chars, schema) {
        var scolors = [], l = chars.length, c;
        for (c = 0; c < l; c++) {
            scolors[c] = schema[chars[c]] || 'white';
        }
        return scolors;
    };

    var Utils = Protael.prototype.Utils; // shortcut

    (function(protaelproto) {
        protaelproto.draw = function() {
            this.paper.draw(this.protein);
            if (!this.CS) {
                this.setColoringScheme("Original");
            }
            // scale to fit
            this.setZoom(iniWidth / this.W);
            this.clearSelection();
            return this;
        };

        protaelproto.setSelection = function(minx, maxx) {
            this.selectedx[0] = minx;
            this.selectedx[1] = maxx;
            var wd = this.toScreenX(maxx) - this.toScreenX(minx - 1);
            // display screen coordinates
            this.paper.selector.attr({
                'width': wd,
                'x': this.toScreenX(minx - 1) + this.currShift
            }).show();
            if (this.controlsEnabled) {
                this.selectInput.val(minx + ":" + maxx);
            }
            return this;
        };
        protaelproto.clearSelection = function(x) {
            this.selectedx = [-1, -1];
            this.paper.selector.attr({
                'x': 0,
                'width': 0
            }).hide().toBack();
            if (this.controlsEnabled) {
                this.selectInput.val('');
            }
            // get current center
            var scr = this.svgDiv.scrollLeft(),
                // TODO: store as variable?
                wd = $('#' + this.container + ' .protael_resizable').width(),
                center = this.toOriginalX(scr + wd / 2);
            if (center > this.W) {
                center = this.W / 2;
            }
            if (this.controlsEnabled) {
                this.selectSlider.slider("values", [center - 1, center + 2]);
            }
            return this;
        };
        protaelproto.translate = function(dx) {
            this.svgDiv.scrollLeft(this.svgDiv.scrollLeft() + dx);
            return this;
        };
        protaelproto.zoomIn = function() {
            this.setZoom(this.currScale + 0.1);
            return this;
        };
        protaelproto.zoomOut = function() {
            this.setZoom(this.currScale - 0.1);
            return this;
        };
        protaelproto.zoomToFit = function() {
            var w = this.svgDiv.width();
            this.setZoom(w / this.W);
            return this;
        };
        protaelproto.zoomToSelection = function() {
            if (this.selectedx[1] === -1)
                return;
            var w = this.selectedx[1] - this.selectedx[0];
            this.setZoom(this.svgDiv.width() / w - 0.2);
            var s = (this.selectedx[0] + w / 2) * this.currScale - this.svgDiv.width() / 2;
            this.svgDiv.scrollLeft(s);
            return this;
        };
        protaelproto.setPaperWidth = function(width) {
            this.paper.setWidth(width);
            return this;
        };
        protaelproto.currentScale = function() {
            return this.currScale;
        };
        protaelproto.getConstruct = function() {
            if (this.selectedx[0] === -1)
                return 'No selection';
            var l = this.protein.label || 'construct';
            return ">" + l + " "
                + this.selectedx[0] + ":" + this.selectedx[1] + "\n"
                + this.protein.sequence.substring(this.selectedx[0] - 1,
                    this.selectedx[1]);
        };
        protaelproto.toOriginalX = function(x) {
            return Math.round((x + this.currShift) / this.currScale);
        };
        protaelproto.toScreenX = function(x) {
            return Math.round(x * this.currScale - this.currShift);
        };
        protaelproto.setShowCursorTooltips = function(val) {
            if (!val)
                this.paper.gLabels.hide();
            this.showCursorTooltips = val;
            return this;
        };

        protaelproto.setZoom = function(zoom) {
            zoom = Math.min(zoom, 15);
            zoom = Math.max(zoom, 0.5);
            this.paper.setZoom(zoom);
            $("#" + this.container + ' .protael_zoomslider').slider("value", this.currScale);
            return this;
        };
        protaelproto.setColoringScheme = function(CS) {
            this.paper.setColoringScheme(CS);
            this.CS = CS;
            return this;
        };

        protaelproto.select = function(query) {
            return Snap.selectAll(query);
        };

    }(Protael.prototype));

    window.Protael = Protael;
    return Protael;
}()); // end of proteal definition

function ProtaelBrowser(protein, container, width, height, controls) {
    var p = Protael(protein, container, width, height, controls).draw();
}