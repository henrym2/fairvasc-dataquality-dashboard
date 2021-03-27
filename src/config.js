export default {
    apiURL: "http://localhost:3000",
    /**
     * Config information for the Highcharts library. Enables zooming and panning using the ctrl key. Also speeds up the loading animation time. 
     */
    zoomAndPan: {
                    'chart': 
                    {
                        'zoomType': 'x',
                        'panKey': 'ctrl', 
                        'panning': {'enabled': true},
                        'pinchType': 'x',
                        'animation': false
                    },
                    'plotOptions': {
                        'series': {
                            'animation': {
                                'defer': 0,
                                'duration': 600
                            }
                        }
                    }
                }
}