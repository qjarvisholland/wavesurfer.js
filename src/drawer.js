'use strict';

WaveSurfer.Drawer = {
    defaultParams: {
        waveColor     : '#999',
        progressColor : '#333',
        cursorColor   : '#ddd',
        markerColor   : '#eee',
        loaderColor   : '#999',
        loaderHeight  : 2,
        cursorWidth   : 1,
        loadPercent   : false,
        markerWidth   : 1,
        container     : null
    },

    init: function (params) {
        this.params = WaveSurfer.util.extend({}, this.defaultParams, params);

        this.container = this.params.container;
        this.width = this.container.clientWidth;
        this.height = this.container.clientHeight;

        this.createSvg();
    },

    node: function (name, attrs) {
        var node = document.createElementNS('http://www.w3.org/2000/svg', name);
        attrs && Object.keys(attrs).forEach(function (key) {
            node.setAttribute(key, attrs[key]);
        });
        return node;
    },

    createSvg: function () {
        this.svg = this.node('svg');

        var defs = this.node('defs');

        // Wave path
        var pathId = WaveSurfer.util.getId();
        var path = this.node('path', {
            id: pathId,
            'stroke-linecap': 'round'
        });
        defs.appendChild(path);

        // Progress clip
        var clipRect = this.node('rect', {
            width: 0,
            height: this.height
        });
        var clipId = WaveSurfer.util.getId();
        var clip = this.node('clipPath', {
            id: clipId
        });
        clip.appendChild(clipRect);
        defs.appendChild(clip);

        var useWave = this.node('use', {
            stroke: this.params.waveColor,
            'class': 'wavesurfer-wave'
        });
        useWave.href.baseVal = '#' + pathId;

        var useClip = this.node('use', {
            stroke: this.params.progressColor,
            'clip-path': 'url(#' + clipId + ')',
            'class': 'wavesurfer-progress'
        });
        useClip.href.baseVal = '#' + pathId;

        var cursor = this.node('rect', {
            width: this.params.cursorWidth,
            height: this.height,
            fill: this.params.cursorColor
        });

        // Loader
        var loader = this.node('line', {
            x1: 0,
            x2: 0,
            y1: this.height / 2 - this.params.loaderHeight / 2,
            y2: this.height / 2 + this.params.loaderHeight,
            'stroke-dasharray': this.width / 30,
            'stroke-width': this.params.loaderHeight,
            stroke: this.params.loaderColor
        });

        [ defs, useWave, useClip, cursor, loader ].forEach(function (node) {
            this.svg.appendChild(node);
        }, this);

        this.container.appendChild(this.svg);

        this.wavePath = path;
        this.progressPath = clipRect;
        this.cursor = cursor;
        this.loader = loader;
    },


    /* API */
    drawPeaks: function (peaks, max) {
        var len = peaks.length;
        var height = this.height;
        var data = [];

        for (var i = 0; i < len; i++) {
            var h = Math.round(peaks[i] * (height / max));
            var x = i;
            var y = Math.round((height - h) / 2);
            data.push('M', x, y, 'l', 0, h);
        }

        var d = data.join(' ');
        this.wavePath.setAttribute('d', d);
        this.loader.style.display = 'none';
    },

    progress: function (progress) {
        var pos = Math.round(progress * this.width);
        if (pos != this.lastPos) {
            this.progressPath.setAttribute('width', pos);
            this.cursor.setAttribute('x', pos);
            this.lastPos = pos;
        }
    },

    loading: function (progress) {
        this.loader.setAttribute('x2', Math.round(progress * this.width));
        this.loader.style.display = 'block';
    },

    addMark: function (mark) {
        var markRect = document.getElementById(mark.id);
        if (!markRect) {
            markRect = this.node('rect');
            markRect.setAttribute('id', mark.id);
            this.svg.appendChild(markRect);
        }
        markRect.setAttribute('fill', mark.color);
        markRect.setAttribute('width', mark.width || 1);
        markRect.setAttribute('height', this.height);
        markRect.setAttribute('x', Math.round(mark.percentage * this.width));
    },

    removeMark: function (mark) {
        var markRect = document.getElementById(mark.id);
        if (markRect) {
            this.svg.removeChild(markRect);
        }
    }
};
