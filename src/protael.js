/**
 * Extend SnapSVG Element
 * TODO: check next snapsvg release for native implementations!
 */
Snap.plugin(function (Snap, Element, Paper, glob) {
    "use strict";
    var e = Element.prototype;
    e.toFront = function () {
        return this.appendTo(this.paper);
    };
    e.toBack = function () {
        return this.prependTo(this.paper);
    };
    e.hide = function () {
        return this.attr({
            'visibility': 'hidden'
        });
    };
    e.show = function () {
        return this.attr({
            'visibility': 'visible'
        });
    };
    /*\
     * Element.dragVertical
     [ method ]
     **
     * Modification of the original drag to allow only vertical drags
     * Adds event handlers for an element's drag gesture
     **
     - onmove (function) handler for moving
     - onstart (function) handler for drag start
     - onend (function) handler for drag end
     - mcontext (object) #optional context for moving handler
     - scontext (object) #optional context for drag start handler
     - econtext (object) #optional context for drag end handler
     * Additionaly following `drag` events are triggered: `drag.start.<id>` on start,
     * `drag.end.<id>` on end and `drag.move.<id>` on every move. When element is dragged over another element
     * `drag.over.<id>` fires as well.
     *
     * Start event and start handler are called in specified context or in context of the element with following parameters:
     o x (number) x position of the mouse
     o y (number) y position of the mouse
     o event (object) DOM event object
     * Move event and move handler are called in specified context or in context of the element with following parameters:
     o dx (number) shift by x from the start point
     o dy (number) shift by y from the start point
     o x (number) x position of the mouse
     o y (number) y position of the mouse
     o event (object) DOM event object
     * End event and end handler are called in specified context or in context of the element with following parameters:
     o event (object) DOM event object
     = (object) @Element
     \*/
    e.dragVertical = function (onmove, onstart, onend, move_scope, start_scope, end_scope) {
        if (!arguments.length) {
            var origTransform;
            return this.drag(function (dx, dy) {
                this.attr({
                    transform: origTransform + (origTransform ? "T" : "t") + [0, dy]
                });
            }, function () {
                origTransform = this.transform().local;
            });
        }
        function start(e, x, y) {
            (e.originalEvent || e).preventDefault();
            this._drag.x = x;
            this._drag.y = y;
            this._drag.id = e.identifier;
            !drag.length && Snap.mousemove(dragMove).mouseup(dragUp);
            drag.push({el: this, move_scope: move_scope, start_scope: start_scope, end_scope: end_scope});
            onstart && eve.on("snap.drag.start." + this.id, onstart);
            onmove && eve.on("snap.drag.move." + this.id, onmove);
            onend && eve.on("snap.drag.end." + this.id, onend);
            eve("snap.drag.start." + this.id, start_scope || move_scope || this, x, y, e);
        }
        this._drag = {};
        draggable.push({el: this, start: start});
        this.mousedown(start);
        return this;
    };
});

/**
 * Protael object
 * @class
 */
var Protael = (function () {
    "use strict";
    /**
     * Current version
     * @type {string}
     */
    Protael.version = "0.1.0";
    Protael.link = "http://proteins.burnham.org:8080/Protael/";
    Protael.linkText = "ProtaelJS";

    var iniWidth, //initial requested width
        uiOptions = {
            mainSeqHeight: 55,
            featureHeight: 15, // height of the feature track
            graphHeight: 50,
            space: 20
        },
    /**
     * Object to keep coloring schemas
     * @memberOf Protael
     */
    ColoringSchemes = (function () {
        // see http://www.bioinformatics.nl/~berndb/aacolour.html
        var o = "orange",
            r = "red",
            b = "blue",
            g = "green",
            m = 'magenta',
            e = 'grey',
            schema = {
                'clustal': {
                    "G": o,
                    "P": o,
                    "S": o,
                    "T": o,
                    'H': r,
                    'K': r,
                    'R': r,
                    'F': b,
                    'W': b,
                    'Y': b,
                    'I': g,
                    'L': g,
                    'M': g,
                    'V': g
                },
                'lesk': {
                    // Small nonpolar
                    'G': o,
                    'A': o,
                    'S': o,
                    'T': o,
                    // Hydrophobic
                    'C': g,
                    'V': g,
                    'I': g,
                    'L': g,
                    'P': g,
                    'F': g,
                    'Y': g,
                    'M': g,
                    'W': g,
                    // Polar
                    'N': m,
                    'Q': m,
                    'H': m,
                    // Negatively charged
                    'D': r,
                    'E': r,
                    // Positively charged
                    'K': b,
                    'R': b
                },
                'maeditor': {
                    'A': 'lightgreen',
                    'G': 'lightgreen',
                    'C': g,
                    'D': 'DarkGreen',
                    'E': 'DarkGreen ',
                    'N': 'DarkGreen ',
                    'Q': 'DarkGreen ',
                    'I': b,
                    'L': b,
                    'M': b,
                    'V': b,
                    'F': '#C8A2C8',
                    'W': '#C8A2C8',
                    'Y': '#C8A2C8', // lilac
                    'H': 'DarkBlue ',
                    'K': o,
                    'R': o,
                    'P': 'pink',
                    'S': r,
                    'T': r
                },
                'cinema': {
                    // Polar positive
                    'H': b,
                    'K': b,
                    'R': b,
                    // Polar negative
                    'D': r,
                    'E': r,
                    // Polar neutral
                    'S': g,
                    'T': g,
                    'N': g,
                    'Q': g,
                    // Non - polar aliphatic.
                    // White is the default color, so don't need this
//                'A': 'white',
//                'V': 'white',
//                'L': 'white',
//                'I': 'white',
//                'M': 'white',
                    // Non - polar aromatic
                    'F': m,
                    'W': m,
                    'Y': m,
                    'P': 'brown',
                    'G': 'brown',
                    'C': 'yellow',
                    // Special characters
                    'B': e,
                    'Z': e,
                    'X': e
                },
                'ali': {
                    'A': e,
                    'R': e,
                    'N': e,
                    'D': e,
                    'C': e,
                    'E': e,
                    'Q': e,
                    'G': e,
                    'H': e,
                    'I': e,
                    'L': e,
                    'K': e,
                    'M': e,
                    'F': e,
                    'P': e,
                    'S': e,
                    'T': e,
                    'W': e,
                    'Y': e,
                    'V': e
                }
            };
        /**
         * Gets Coloring by name, or Clustal CS
         * @param {type} colorscheme
         * @returns {schema.clustal|_L32.schema.clustal|schema|_L32.schema}
         */
        function getCSchema(colorscheme) {
            colorscheme = colorscheme.toLowerCase();
            return schema[colorscheme] || schema.clustal;
        }

        return {getCSchema: getCSchema};
    }());

    /**
     * Create toolbar.
     * @private
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
                step: .02,
                slide: function (event, ui) {
                    r.setZoom(ui.value);
                }
            }));
        toolbar.a($('<button>Zoom to fit</button>').button({
            text: false,
            icons: {
                primary: "ui-icon ui-icon-arrow-4-diag"
            }
        }).click(function () {
            r.zoomToFit();
        }));
        toolbar.a($('<button>Zoom to selection</button>').button({
            text: false,
            icons: {
                primary: "ui-icon ui-icon-arrowthick-2-e-w"
            }
        }).click(function () {
            r.zoomToSelection();
        }));
        toolbar.a('&nbsp;&VerticalLine;&nbsp;Selection: <input type="text" class="protael_selection_inp" readonly/>');
        toolbar.a($('<button id="export">Export</button>').button({
            text: false,
            icons: {
                primary: "ui-icon-disk"
            }
        }).click(function () {
            $("#xarea").text(r.getConstruct());
            $("#xdialog").dialog("open");
        }));

        $("#xdialog").dialog({
            modal: true,
            autoOpen: false,
            buttons: {
                Ok: function () {
                    $(this).dialog("close");
                }
            }
        });
        toolbar.a($('<button>Reset selection</button>').button({
            text: false,
            icons: {
                primary: "ui-icon-refresh"
            }
        }).click(function () {
            r.clearSelection();
        }));
        toolbar.a('&nbsp;&VerticalLine;&nbsp;Coloring:');
        toolbar.a($(
            '<select><option>Original</option><option>Clustal</option><option>Lesk</option><option>Cinema</option><option>MAEditor</option><option>ALI</option><option>None</option></select>')
            .change(function () {
                r.setColoringScheme($(this).val());
            }));


        if (!showControls)
            toolbar.hide();

        toolbar.a('&nbsp;&VerticalLine;&nbsp;');
        toolbar.a($(
            '<input type="checkbox" id="chkTooltip" checked="true"><label for="chkTooltip">Cursor tooltips</label>')
            .change(
                function () {
                    r.setShowCursorTooltips($("#chkTooltip").is(':checked'));
                }));

        toolbar.a('&nbsp;&VerticalLine;&nbsp;');
        toolbar.a($('<button>Export SVG</button>').button({
            text: false,
            icons: {
                primary: "ui-icon ui-icon-image"
            }
        }).click(function () {
            r.saveAsSVG();
        }));
        // toolbar.append('ScreenX: <input type="text" id="sx_inp" readonly/>');
        // toolbar.append('RealX: <input type="text" id="rx_inp" readonly/>');
    }

    /**
     * @constructor
     * @memberOf Protael
     * @param {Protein} protein Protein JSON
     * @param {string} container ID of the container to which Protael is appended
     * @param {boolean} controls Whether or not enabelt controls/toolbar
     */
    function Protael(protein, container, controls) {
        if (!(this instanceof  Protael)) {
            return new Protael(protein, container, controls);
        }
        //create dom structure; this is ugly, i know
        //TODO: clean up this mess
        var browser = navigator.appVersion,
            self = this,
            s = '<div class="ui-widget-content protael_resizable"></div>',
            newDiv = $(s),
            toolbar = $('<div class="ui-widget-header ui-corner-all protael_toolbar"></div>'),
            svgString = '<div width="100%" height="100%" class="protael_svg">' +
            '<div><div class="protael_slider"></div></div>' +
            '<svg id="' + container + '_svgcanvas" width="100%" height="100%" preserveAspectRatio="xMinYMin meet">'
            + '<desc>Protael ' + Protael.version + '</desc>'
            + '</svg></div>',
            svg = $(svgString);

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
                slide: function (event, ui) {
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

        // need this flag to implement "strechable" sequence
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
            stop: function (ev, ui) {
                self.zoomToFit();
            }
        });
    }

    /**
     * Paper object for drawing.
     * Do not use directly, this is called from Protael constructor
     *
     * @class Paper
     * @memberOf Protael
     * @private
     * @constructor
     * @param {string} container Parent container ID
     * @param {number} w paper width
     * @param {number} h paper height
     * @param {Protael} parent Protael object reference
     * @returns {Paper}
     */
    function Paper(container, w, h, parent) {
        this.protael = parent;
        this.paper = Snap("#" + container + '_svgcanvas');
        this.paper.attr({
            "viewBox": "0 0 " + w + " " + h
        });
        var p = this.paper; //shortcut

        this.pLink = p.text(0, 0, "Powered by Protael").attr({"id": "prref"});
        this.pLink.click(function () {
            window.open("http://proteins.burnham.org:8080/Protael/");
        });
        this.viewSet = Snap.set(); // contains all objects for scaling
        this.textSet = Snap.set(); // contains all text elements of the canvas
        this.textSet.push(this.pLink);
        this.overlayFtLabels = Snap.set(); // contains labels for overlay features (for
        // switching views on zoomin/out)
        this.createDefs();
//
        //Groups to hold different parts of the plot//
        this.gAxes = p.g().attr({id: "axes"}); // axes and lanels
        this.gSequences = p.g().attr({id: "seqs"}); // sequence chars and backgrounds
        this.gFTracks = p.g().attr({id: "ftracks"}); // feature tracks
        this.gQTracks = p.g().attr({id: "qtracks"}); // quantitative tracks
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
        return this;
    }

    /**
     * @memberOf Paper
     * @param {type} paperproto
     * @returns {undefined}
     */
    (function (paperproto) {
        /**
         * Sets new paper size.
         * @memberOf Paper
         * @param {number} w new width
         * @param {number} h new heigt
         * @returns {undefined}
         */
        paperproto.setSize = function (w, h) {
            var p = this.paper, vb = p.attr("viewBox"),
                vbl = this.pLink.getBBox(),
                hh = ''.concat(h).concat('px');
            vb.height = h;
            p.attr({
                height: hh,
                width: w,
                viewBox: vb
            });
            this.pLink.attr({
                x: w - 5, // - vbl.width-5,
                y: h //- vbl.height-5
            });
            return this;
        };

        /**
         * Gets current paper width.
         * @returns {number}
         */
        paperproto.getWidth = function () {
            return this.paper.attr("width");
        };
        /**
         *
         * @param {number} zoom - requested zoom
         * @returns {undefined}
         */
        paperproto.setZoom = function (zoom) {
            var p = this.protael,
                ds = zoom / p.currScale,
                w = this.getWidth();

            if (w.indexOf('px') > 0) {
                w = w.replace(/[^\d.-]/g, '');
            }

            var newWidth = Math.round(w * ds);
            this.setWidth(newWidth);

            this.viewSet.forEach(function (t) {
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
            this.textSet.forEach(function (t) {
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
            p.currScale > 7 ? this.overlayFtLabels.forEach(function (t) {
                t.hide();
            }) : this.overlayFtLabels.forEach(function (t) {
                t.show();
            });
            return this;
        };

        /**
         *
         * @param {number} w
         * @param {number} dx
         * @returns {_L399.paperproto.gAxes}
         */
        paperproto.axis = function (w, dx) {
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
        paperproto.createDefs = function () {
            var p = this.paper,
                dx = 5, dy = 8, y = 38,
                thegap = p.g().attr({
                id: "gap",
                "stroke-width": 2
            }),
                s = "m 9.943742,1.54515 0,7.665216 C 9,15 8.977801,15 6,18 5.092011,19.329493 0.900884,20.578894 0,22 -0.903141,20.578894 -4.252632,19.379901 -5.160607,18.050408 -7.745849,14.487355 -9.7582132,11.922758 -9.6863207,9.212778 l 0,-7.667628 -5.7594933,0 0,7.665216 c 0.07412,5.544348 3.171965,8.901205 5.6876008,12.525256 2.6545072,3.598566 6.1354302,5.259308 6.0060532,7.136425 L -3.75216,38 4,38 4,28.866878 c -0.129374,-1.874375 3.351556,-3.535283 6.006045,-7.133892 2.518073,-3.62402 5.613376,-6.978272 5.687696,-12.52262 l 0,-7.665216 z";
            p.path(s).transform("scale(0.3)").attr({id: "glycan"}).toDefs();

            s = "m 9.943742,1.54515 0,7.665216 c 0.01858,0.678098 -1.8182777,4.537747 -2.31158,4.024493 L -1.548312,3.388971 -5,6.5 6.022199,18 C 5.11421,19.329493 2.03074,20.719454 1.129856,22.14056 0.226715,20.719454 -4.252632,19.379901 -5.160607,18.050408 -7.745849,14.487355 -9.7582132,11.922758 -9.6863207,9.212778 l 0,-7.667628 -5.7594933,0 0,7.665216 c 0.07412,5.544348 3.171965,8.901205 5.6876008,12.525256 2.6545072,3.598566 6.1354302,5.259308 6.0060532,7.136425 L -3.75216,38 4,38 4,28.866878 c -0.129374,-1.874375 3.351556,-3.535283 6.006045,-7.133892 2.518073,-3.62402 5.613376,-6.978272 5.687696,-12.52262 l 0,-7.665216 z";
            p.path(s).transform("scale(0.3)").attr({
                id: "oliglycan"
            }).toDefs();


            s = "M 9.943742,1.54515 5.757162,5.359859 4,1.625 l -7,0 -2.311321,3.712778 -4.3749997,-3.792628 -5.7594933,0 5.6876008,8.190472 c 2.6545072,3.598566 6.1354302,1.259308 6.0060532,3.136425 L -3.75216,38 4,38 4,12.866878 C 4,11 7.351556,13.331595 10.006045,9.732986 L 15.693741,1.54515 z";
            p.path(s).transform("scale(0.3) ").attr({
                id: "unknownglycan"
            }).toDefs();

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

        /**
         * Adds marker definition
         * @param {type} defpath path describing the marker
         * @param {type} label name of the marker
         * @returns {undefined}
         */
        paperproto.addDef = function (defpath, label, transform) {
            if (this.paper.el("use").attr({"xlink:href": "#" + label}))
            {
                console.log("Marker with the name '" + label + "' already exists!");
                return;
            }
            var d = this.paper.path(defpath).attr({
                id: label
            });
            if (transform) {
                d.transform(transform);
            }

            d.toDefs();
        };

        /**
         *
         * @param {string} defid Marker ID
         * @param {number} x X-coordinate
         * @param {number} y Y -coordinate
         * @param {object} attrs
         * @returns {@this;@pro;paper@call;g}
         */
        paperproto.createUse = function (defid, x, y, attrs) {
            var el = this.paper.el("use").attr({
                x: x - 0.5,
                y: y,
                "xlink:href": "#" + defid
            }),
                r = this.paper.rect(x - .75, y, 1.5, 15).attr({opacity: 0}),
                g = this.paper.g(r, el);
            g.attr(attrs);
            this.viewSet.push(r);
            this.viewSet.push(el);
            return g;
        };
        paperproto.setWidth = function (width) {
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
        paperproto.proteinSeqBG = function (chars, scolors, yy, showSequence, offset, label) {
            offset = offset * 1 - 1 || 0;
            var inst = this.protael,
                self = this,
                paper = this.paper,
                white = 'white';
            setTimeout(
                function () {
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

        paperproto.proteinSequence = function (chars, y, showSequence, alignment) {
            alignment = alignment || {};
            y = y || 10;

            var p = this.paper,
                self = this,
                label = alignment.description || alignment.label || alignment.id,
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
            alignment.data = alignment.data || {};
            if (alignment.clazz) {
                rect.attr({"class": alignment.clazz});
            }

            if (alignment.description) {
                alignment.data['Description'] = alignment.description;
            }

            if (alignment.data) {
                rect.attr(dataAttrToDataStar(alignment.data));
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
                    setTimeout(function () {
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

        paperproto.clearColoring = function () {
            //TODO: use forEach()
            for (var c in this.seqBGSet)
                this.viewSet.exclude(this.seqBGSet[c]);
            this.seqBGSet.clear();
        };

        paperproto.setColoringScheme = function (CS) {
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
                            if (ali.seqcolors.colors && Array.isArray(ali.seqcolors.colors)) {
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

        paperproto.featureTrack = function (ftrack, topY, height, allowOverlaps, showLabels, isOverlay) {
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
                f,
                dataatt,
                maxF = ftrack.features.length;

            this.gFTracks.add(g);
            seenDeltas.push(0);

            if (allowOverlaps) {
                for (f = 0; f < maxF; f++) {
                    ft = ftrack.features[f];
                    if (ft) {
                        var featureGroup = this.feature(ft, ft.color || color, display,
                            topY, height, g, showLabels, allowOverlaps, isOverlay);
                        if (ft.click) {
                            featureGroup.click(ft.click(ft.dbxrefs));
                        }

                        if (ft.data) {
                            dataatt = dataAttrToDataStar(ft.data);
                            featureGroup.attr(dataatt);
                        }
                    }
                }
            }
            else {
                ftrack.features.sort(function (a, b) {
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
                            if (ft.data) {
                                dataatt = dataAttrToDataStar(ft.data);
                                featureGroup.attr(dataatt);
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
            g.dragVertical();
            return lastLevel;
        };
        paperproto.feature = function (feature, color, display, topY, height, g, showLabel, allowOverlaps, isOverlay) {
            var s = feature.start - 1,
                e = feature.end,
                shapeGr,
                shape,
                label,
                clazz = 'pl-feature',
                paper = this.paper;
            //      console.log("\tDrawing feature: " + feature.label);
            if (display === 'block') {
                shape = paper.rect(s, topY, e - s, height);
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
                label = paper.text((0.5 * s + 0.5 * e), topY + height - 5,
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

        /**
         * Creates formated path string for SVG cubic path element
         * @param {type} x1
         * @param {type} y1
         * @param {type} px1
         * @param {type} py1
         * @param {type} px2
         * @param {type} py2
         * @param {type} x2
         * @param {type} y2
         * @returns {String}
         */
        paperproto.path = function (x1, y1, px1, py1, px2, py2, x2, y2) {
            return "L" + x1 + " " + y1 + " C" + px1 + " " + py1 + " " + px2 + " " + py2 + " " + x2 + " " + y2;
        };

        /* computes control points given knots K, this is the brain of the operation
         * From: http://www.particleincell.com/blog/2012/bezier-splines/
         * */
        function computeControlPoints(K) {
            var i, m,
                p1 = new Array(),
                p2 = new Array(),
                n = K.length - 1,
                /*rhs vector*/
                a = new Array(),
                b = new Array(),
                c = new Array(),
                r = new Array();

            /*left most segment*/
            a[0] = 0;
            b[0] = 2;
            c[0] = 1;
            r[0] = K[0] + 2 * K[1];

            /*internal segments*/
            for (i = 1; i < n - 1; i++) {
                a[i] = 1;
                b[i] = 4;
                c[i] = 1;
                r[i] = 4 * K[i] + 2 * K[i + 1];
            }

            /*right segment*/
            a[n - 1] = 2;
            b[n - 1] = 7;
            c[n - 1] = 0;
            r[n - 1] = 8 * K[n - 1] + K[n];

            /*solves Ax=b with the Thomas algorithm (from Wikipedia)*/
            for (i = 1; i < n; i++) {
                m = a[i] / b[i - 1];
                b[i] = b[i] - m * c[i - 1];
                r[i] = r[i] - m * r[i - 1];
            }

            p1[n - 1] = r[n - 1] / b[n - 1];
            for (i = n - 2; i >= 0; --i) {
                p1[i] = (r[i] - c[i] * p1[i + 1]) / b[i];
            }

            /*we have p1, now compute p2*/
            for (i = 0; i < n - 1; i++) {
                p2[i] = 2 * K[i + 1] - p1[i + 1];
            }
            p2[n - 1] = 0.5 * (K[n] + p1[n - 1]);

            return {p1: p1, p2: p2};
        }

        paperproto.quantTrack = function (qtrack, topY, width, height) {
            //    console.log("Drawing qtrack: " + qtrack.values);
            var vv = Array.isArray(qtrack.values) ?
                qtrack.values : Utils.splitData(qtrack.values),
                i, j, jj,
                c = qtrack.color || "#F00",
                fill = c,
                max = Math.max.apply(Math, vv),
                min = Math.min.apply(Math, vv),
                zero = (-min) / (max - min) * 100,
                path = '',
                ky = height / (max - min),
                // different achart types
                spline = "spline",
                column = "column",
                area = "area",
                areaspline = "area-spline",
                line = "line",
                type = qtrack.type || areaspline,
                X, Y, W = this.protael.W,
                paper = this.paper,
                chart2;

            // pad values aray with 0
            for (i = vv.length; i <= width; i++) {
                vv[i] = 0;
            }

            if (Array.isArray(c)) {
                if (c.length === 1) {
                    fill = c[0];
                } else if (c.length === 2) {
                    if (c[1] !== '') {
                        fill = paper.gradient("l(0, 1, 0, 0)" + c[0] + ':10-' + c[1] + ':90');
                    }
                }
                else if (c.length === 3) {
                    if (c[1] === '') {
                        fill = c[0];
                    } else if (c[2] === '') {
                        fill = paper.gradient("l(0, 1, 0, 0)" + c[0] + ':10-' + c[1] + ':90');
                    } else {
                        fill = paper.gradient("l(0, 1, 0, 0)" + c[0] + ':10-' + c[1] + ":" + zero + '-' + c[2] + ':90');
                    }
                }
            }

            if (type === area || type === line || type === areaspline || type === spline) {
                path = "M0 " + (height + min * ky);
                if (type === area || type === line) {
                    // no smoothing required, just connect the dots
                    for (j = 0; j < W; j++) {
                        X = j;
                        Y = height - (vv[j] - min) * ky;
                        if (j !== jj - 1) {
                            path = path + "L" + X + ", " + Y;
                        }
                    }
                    path = path + 'L' + (W) + ' ' + (height + min * ky) + " Z";
                } else if (type === areaspline || type === spline) {
                    /*grab (x,y) coordinates of the control points*/
                    var xx = new Array(),
                        yy = new Array(), px, py;

                    for (i = 0; i < W; i++) {
                        /*use parseInt to convert string to int*/
                        xx[i] = i;
                        yy[i] = height - (vv[i] - min) * ky;
                    }

                    /*computes control points p1 and p2 for x and y direction*/
                    px = computeControlPoints(xx);
                    py = computeControlPoints(yy);

                    /*updates path settings, the browser will draw the new spline*/
                    for (i = 0; i < W; i++) {
                        path +=
                            this.path(xx[i], yy[i], px.p1[i], py.p1[i], px.p2[i], py.p2[i], xx[i + 1], yy[i + 1]);
                    }
                    path = path + 'L' + (W) + ' ' + (height + min * ky) + " Z";
                }

                chart2 = paper.path(path).attr({
                    stroke: fill,
                    fill: fill,
                    "class": "pl-chart-area"
                });

                if (type === line || type === spline) {
                    // fill with transparent paint
                    chart2.attr({
                        "fill-opacity": 0,
                        "stroke-width": ".1px"});
                }
            } else if (qtrack.type === column) {
                // column chart
                var rects = paper.g().attr({
                    stroke: fill,
                    "fill": "orange",
                    "class": "pl-chart-area",
                    opacity: 1.0
                });
                var y0 = height + min * ky;

                for (j = 0; j < W; j++) {
                    X = j;
                    var dh = 0;

                    if (vv[j] >= 0) {
                        Y = (max - vv[j]) * ky;
                        dh = vv[j] * ky;
                    } else {
                        Y = y0;
                        dh = -vv[j] * ky;
                    }

                    var r = paper.rect(X, Y, 1, dh);
                    this.viewSet.push(r);
                    rects.add(r);
                }
                chart2 = paper.rect(0, 0, W, height).attr({
                    stroke: fill,
                    fill: fill,
                    mask: rects
                });
            } else {
                console.log("Unknown chart type :" + type);
            }

            var label = paper.text(.1, 8, qtrack.label).attr({"class": "pl-chart-label"}),
                topLine = paper.line(0, 0, W, 0).attr({"class": "pl-chart-top"}),
                cLine = paper.line(0, max * ky, W, max * ky).attr({"class": "pl-chart-center"}),
                bottomLine = paper.line(0, height, W, height).attr({"class": "pl-chart-bottom"}),
                g = paper.g(chart2, topLine, bottomLine, cLine, label).attr({id: "qtrack_" + qtrack.label}).transform("translate(0, " + topY + ")");

            if (qtrack.data) {
                g.attr(dataAttrToDataStar(qtrack.data));
            }

            /**** Try out for draggable elements*/
            g.dragVertical();


            this.gQTracks.add(g);

            this.viewSet.push(topLine);
            this.viewSet.push(bottomLine);
            this.viewSet.push(cLine);
            this.viewSet.push(chart2);
            this.textSet.push(label);
        };

        paperproto.proteinMarkers = function (markers, topY) {
            var markerGp = this.paper.g().attr({
                id: "gMarkers"
            }),
                i,
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
                }, r, g;
            for (i = markers.length; i--; ) {
                m = markers[i];
                if (!m.x || m.x === "") {
                    continue;
                }
                shift = (m.position === 'bottom') ? 26 : 0;
                type = m.type ? m.type : "glycan";

                //TODO: add IDs
                id = m.label ? "m_" + m.label : "m_" + i;
                mark = this.createUse(type, m.x, topY + shift, {
                    id: id,
                    title: m.label ? m.label : type
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

                if (m.data) {
                    mark.attr(dataAttrToDataStar(m.data));

                }

                markerGp.add(mark);
            }
        };

        paperproto.proteinBridges = function (bridges, topY) {
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

                if (b.data) {
                    gb.attr(dataAttrToDataStar(b.data));
                }
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

        paperproto.draw = function (protein) {
            var scolors = [],
                chars = protein.sequence.toUpperCase().split(''),
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
                if (protein.qtracks[i].values && protein.qtracks[i].values.length) {
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
                } else {
                    console.log("No values found for QTRACK [" + i + "]. Skipping.");
                }
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

            this.pointer = paper.rect(0, 0, 1, this.protael.H).attr({
                fill: 'green',
                stroke: 'green',
                "stroke-width": "1px",
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

            paper.mousemove(function (e) {
                e = e || window.event;
                var xoff = e.offsetX,
                    c = "#" + parent.container + ' #blanket',
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
                        if (protein.qtracks[q].values) {
                            var lb = qtrackLbls[q],
                                r = qtrackBgs[q];
                            lb.node.textContent = protein.qtracks[q].values[OX];
                            var l = lb.getBBox().width;
                            r.attr({
                                width: l
                            });
                        }
                    }
                }
            }).mouseout(function () {
                self.gLabels.hide();
                self.pointer.hide();
            });
            this.viewSet.push(r);

//            this.gView = paper.g(this.gAxes, this.gSequences, this.gFTracks, this.gQTracks, this.seqLines,this.seqLineCovers, this.seqBGSet, this.seqChars,  this.seqLabelsSet, this.selector, this.pointer, this.gLabels).attr({id: "mainView"})
//            .transform("translate(0, 10)");
        };

        /**
         * Returns content of the paper as SVG string
         * @returns {string} SVG string representing current paper content
         */
        paperproto.toSVGString = function () {
            return this.paper.toString();
        };

        /**
         * Convert data attributes of JSON object to data-* HTML5 attributes.
         * @param {type} data
         * @returns {unresolved}
         */
        function dataAttrToDataStar(data) {
            var res = {};
            res['data-d'] = JSON.stringify(data);
            return res;
        }
    }(Paper.prototype));
    Protael.Paper = Paper;
    Protael.prototype.Utils = {};
    Protael.prototype.Utils.calcHeight = function (protein) {
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
    Protael.prototype.Utils.splitData = function (data) {
        return (data.indexOf(',') > 0) ? data.split(',') : data.split('');
    };
    /**
     * Returns array of colors, one per residue
     * @param {type} chars
     * @param {type} schema
     * @returns {Array}
     */
    Protael.prototype.Utils.getColors = function (chars, schema) {
        var scolors = [], l = chars.length, c;
        for (c = 0; c < l; c++) {
            scolors[c] = schema[chars[c]] || 'white';
        }
        return scolors;
    };

    var Utils = Protael.prototype.Utils; // shortcut

    (function (protaelproto) {
        protaelproto.draw = function () {
            this.paper.draw(this.protein);
            if (!this.CS) {
                this.setColoringScheme("Original");
            }
            // scale to fit
            this.setZoom(iniWidth / this.W);
            this.clearSelection();
            this.initTooltips();
            return this;
        };

        protaelproto.setSelection = function (minx, maxx) {
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
        protaelproto.clearSelection = function (x) {
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
        protaelproto.translate = function (dx) {
            this.svgDiv.scrollLeft(this.svgDiv.scrollLeft() + dx);
            return this;
        };
        protaelproto.zoomIn = function () {
            this.setZoom(this.currScale + 0.1);
            return this;
        };
        protaelproto.zoomOut = function () {
            this.setZoom(this.currScale - 0.1);
            return this;
        };
        protaelproto.zoomToFit = function () {
            var w = this.svgDiv.width();
            this.setZoom(w / this.W);
            return this;
        };
        protaelproto.zoomToSelection = function () {
            if (this.selectedx[1] === -1)
                return;
            var w = this.selectedx[1] - this.selectedx[0];
            this.setZoom(this.svgDiv.width() / w - 0.2);
            var s = (this.selectedx[0] + w / 2) * this.currScale - this.svgDiv.width() / 2;
            this.svgDiv.scrollLeft(s);
            return this;
        };
        protaelproto.setPaperWidth = function (width) {
            this.paper.setWidth(width);
            return this;
        };
        protaelproto.currentScale = function () {
            return this.currScale;
        };
        protaelproto.getConstruct = function () {
            if (this.selectedx[0] === -1)
                return 'No selection';
            var l = this.protein.label || 'construct';
            return ">" + l + " "
                + this.selectedx[0] + ":" + this.selectedx[1] + "\n"
                + this.protein.sequence.substring(this.selectedx[0] - 1,
                    this.selectedx[1]);
        };
        protaelproto.toOriginalX = function (x) {
            return Math.round((x + this.currShift) / this.currScale);
        };
        protaelproto.toScreenX = function (x) {
            return Math.round(x * this.currScale - this.currShift);
        };
        protaelproto.setShowCursorTooltips = function (val) {
            if (!val)
                this.paper.gLabels.hide();
            this.showCursorTooltips = val;
            return this;
        };

        protaelproto.setZoom = function (zoom) {
            zoom = Math.min(zoom, 15);
            zoom = Math.max(zoom, 0.5);
            this.paper.setZoom(zoom);
            $("#" + this.container + ' .protael_zoomslider').slider("value", this.currScale);
            return this;
        };
        protaelproto.setColoringScheme = function (CS) {
            this.paper.setColoringScheme(CS);
            this.CS = CS;
            return this;
        };

        protaelproto.select = function (query) {
            return Snap.selectAll(query);
        };


        protaelproto.toSVGString = function () {
            return this.paper.toSVGString();
        };

        protaelproto.saveAsSVG = function () {
            //TODO: have to separate style for graph elements and ui elements
            // and use only graph styles for export
            var prefix = '<?xml version="1.0" standalone="yes"?>\n' +
                '<?xml-stylesheet href="http://proteins.burnham.org:8080/Protael/css/protael.css" type="text/css"?>\n' +
                '<svg xmlns:xlink="http://www.w3.org/1999/xlink" ',
                svg = prefix + ' ' + this.toSVGString().substring(4),
                blob = new Blob([svg], {type: "image/svg+xml"});
            // from FileSaver.js
            saveAs(blob, "protael_export.svg");
        };

        protaelproto.addDefinition = function (defpath, label, transform) {
            this.paper.addDef(defpath, label, transform);
        };

        protaelproto.initTooltips = function () {
            $(document).tooltip({
                track: true,
                content: function () {
                    var element = $(this);
                    if (element.is("[data-d]")) {
                        var data = element.data("d"), res = '<table>';

                        for (var i in data) {
                            if (i === 'pdbid') {
                                res += '<tr><td colspan="2"><img src="http://www.rcsb.org/pdb/images/' + data[i] + '_bio_r_250.jpg"></td></tr>';
                            } else {
                                res += "<tr><td>" + i + ':</td><td>' + data[i] + '</td></tr>';
                            }
                        }
                        res += "</table>"
                        return res;
                    } else if (element.is("[title]")) {
                        return element.attr("title");
                    } else if (element.is("img")) {
                        return element.attr("alt");
                    }
                }
            });
        };
    }(Protael.prototype));

    window.Protael = Protael;
    return Protael;
}()); // end of protael definition

/*
 * Support old version
 */
function ProtaelBrowser(protein, container, width, height, controls) {
    Protael(protein, container, controls).draw();

}
;