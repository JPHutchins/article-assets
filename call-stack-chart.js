/**
 * Copyright (c) 2024 github.com/sparklerfish & github.com/JPHutchins
 * SPDX-License-Identifier: Apache-2.0
 * 
 * <script src="https://cdn.plot.ly/plotly-2.34.0.min.js" charset="utf-8"></script>
 * 
 */

const RETURN_VARIABLE = 'Return Value';
const BEFORE_CALL = 'Before Call';
const DURING_CALL = 'During Call';
const AFTER_CALL = 'After Call';

const argumentTypeNames = {
    id: 'string',
    title: 'string',
    returnValueSize: 'number',
    returnValueOnCallStack: 'boolean',
    callArgs: 'object',
    linkRegister: 'boolean',
    padding: 'number',
    yMax: 'number',
};

/**
 * @typedef {Object} ArgumentType
 * @property {string} id
 * @property {string} title
 * @property {number} returnValueSize
 * @property {boolean} returnValueOnCallStack
 * @property {Array<{name: string, size: number, color: string}>} callArgs
 * @property {boolean} linkRegister
 * @property {number} padding
 * @property {number} yMax
 */

/**
 * Create a call stack chart.
 * 
 * @param {ArgumentType} options - The options for creating the call stack chart.
 * @param {string} options.id - The id of the chart.
 * @param {string} options.title - The title of the chart.
 * @param {number} options.returnValueSize - The size of the return value.
 * @param {boolean} options.returnValueOnCallStack - Whether the return value is on the call stack.
 * @param {Array<{name: string, size: number, color: string}>} options.callArgs - The arguments of the function call.
 * @param {boolean} options.linkRegister - Whether the link register is used.
 * @param {number} options.padding - The padding size.
 * @param {number} options.yMax - The maximum value for the y-axis.
 */

export const createCallStackChart = (options) => {
    Object.entries(argumentTypeNames).forEach(([arg, type]) => {
        if (typeof options[arg] !== type) {
            throw new Error(`Expected ${arg} to be of type ${type}`);
        }
    });

    const { 
        id,
        title,
        returnValueSize,
        returnValueOnCallStack,
        callArgs,
        linkRegister,
        padding,
        yMax,
    } = options;

    const callStackFrameSize = 0
        + returnValueSize * (returnValueOnCallStack ? 1 : 0) 
        + callArgs.reduce((acc, {size}) => acc + size, 0)
        + (linkRegister ? 4 : 0)
        + 4 // Frame Pointer
        + padding;

    const layout = {
        barmode: 'stack',
        title: title,
        xaxis: {
            title: 'Call State',
        },
        yaxis: {
            title: 'Stack Usage (Bytes)',
            range: [0, yMax],
        },
        showlegend: false,
        uniformtext: {
            mode: 'hide',
            minsize: 8,
        },
        margin: {
            l: 40,
            r: 0,
            t: 100,
            b: 40,
        },
        annotations: [
            {
                x: 0.38,
                y: returnValueSize + callStackFrameSize / 2,
                xref: 'x',
                yref: 'y',
                text: 'Function Call',
                showarrow: false,
                font: {
                    color: 'grey',
                    size: 12,
                },
                textangle: 270,
            },
            {
                x: 0.5,
                y: returnValueSize + callStackFrameSize + 2,
                xref: 'paper',
                yref: 'y',
                text: `${callStackFrameSize} Bytes`,
                showarrow: false,
                font: {
                    color: 'grey',
                    size: 12,
                },
            },
        ],
        shapes: [
            {
                type: 'line',
                x0: 0,
                y0: returnValueSize,
                x1: 1,
                y1: returnValueSize,
                xref: 'paper',
                yref: 'y',
                line: {
                    color: 'black',
                    width: 2,
                },
            },
            {
                type: 'rect',
                x0: 0.45,
                x1: 1.54,
                y0: returnValueSize - 4,
                y1: returnValueSize + callStackFrameSize + 4,
                xref: 'x',
                yref: 'y',
                line: {
                    color: 'grey',
                    width: 2,
                    dash: 'dot',
                },
            },
        ],
    };

    /**
     * Create a bar stack.
     * 
     * @param {string} x The column to put the stack on.
     * @param {number} y The size of the stack.
     * @param {string} color The color of the stack.
     * @param {string} shape The pattern shape: `'' | '/' | '\' | 'X' | '-' | '|' | '+' | '.'`
     * @param {string} text The name of the stack.
     * @returns 
     */
    const barStack = (x, y, color, shape, text) => ({
        x: [x],
        y: [y],
        type: 'bar',
        hoverinfo: 'y',
        marker: {
            color,
            line: {
                color: 'black',
                width: 1
            },
            pattern: {
                shape,
                size: 8,
                solidity: 0.5
            },
        },
        textposition: 'inside',
        insidetextanchor: 'middle',
        text,
    });

    Plotly.newPlot(
        id,
        [
            barStack(BEFORE_CALL, returnValueSize, 'lightgrey', '', RETURN_VARIABLE),
            barStack(DURING_CALL, returnValueSize, ...(returnValueOnCallStack ? ['lightgrey', ''] : ['lightblue', '/']), RETURN_VARIABLE),
            ...(linkRegister ? [barStack(DURING_CALL, 4, 'lightgreen', '', 'Link Register')] : []),
            barStack(DURING_CALL, 4, 'lightgreen', '', 'Frame Pointer'),
            ...callArgs.map(({ name, size, color }, index) => barStack(DURING_CALL, size, color, '', `Argument ${index} (${name})`)),
            ...(returnValueOnCallStack ? [barStack(DURING_CALL, returnValueSize, 'lightblue', '/', 'Return Value')] : []),
            barStack(DURING_CALL, padding, 'white', '', 'Padding'),
            barStack(AFTER_CALL, returnValueSize, 'lightblue', '', RETURN_VARIABLE)
        ],
        layout,
        {
            responsive: true,
            displayModeBar: false,
            staticPlot: true,
        },
    );

    const sourceLink = document.createElement('a');
    sourceLink.href = 'https://github.com/JPHutchins/article-assets/blob/main/call-stack-chart.js';
    sourceLink.target = '_blank';
    sourceLink.textContent = '© 2024 JPHutchins + sparklerfish | Source Code';
    sourceLink.classList.add('source-link'); 
    document.getElementById(id).appendChild(sourceLink);
};
