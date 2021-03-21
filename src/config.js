export default {
    apiURL: "http://localhost:3000",
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