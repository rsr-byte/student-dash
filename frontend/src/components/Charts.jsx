import * as React from 'react';
import { useAnimate } from '@mui/x-charts/hooks';
import { styled } from '@mui/material/styles';
import { interpolateObject } from '@mui/x-charts-vendor/d3-interpolate';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Slider from '@mui/material/Slider';
import { BarChart } from '@mui/x-charts/BarChart';


export default function PaginatedHorizontalBars(props) {

  const [page, setPage] = React.useState(0);

  if (!props.data || props.data.length === 0) {
    return <div>Loading...</div>;
  }


  const totalItems = props.data.length;
  const totalPages = Math.ceil(totalItems / 5);

  const startIdx = page * 5;
  const endIdx = startIdx + 5;
  const currentPageData = props.data.slice(startIdx, endIdx);


  if (!currentPageData || currentPageData.length === 0) {
    return <div>Loading chart data...</div>;
  }


  const values = currentPageData.map(
    (d) => {
      const val = d[props.semester === "CGPA" ? "cgpa" : props.semester];
      
      const parsedVal = parseFloat(val);
    
      return isNaN(parsedVal) ? null : parsedVal;
    }
  );


  const numericValues = values.filter(val => val !== null && isFinite(val));


  if (numericValues.length === 0) {
    console.warn("No valid numeric values to plot");
    return null;
  }

  const minValue = Math.min(...numericValues);
  const maxValue = Math.max(...numericValues);




  const rangeTolerance = 0.001; 

  let safeMin = minValue;
  let safeMax = maxValue;

  if (Math.abs(maxValue - minValue) < rangeTolerance) {
    safeMin = minValue - rangeTolerance / 2;
    safeMax = maxValue + rangeTolerance / 2;
  }

  function hasLettersAndNumbers(str) {
    const hasLetters = /[A-Za-z]/.test(str);
    const hasNumbers = /[0-9]/.test(str);
    return hasLetters && hasNumbers;
  }


  const getBarLabel = React.useMemo(() => {
    return (item) => {
      const name = currentPageData[item.dataIndex]?.name;

      if (hasLettersAndNumbers(name)) {
        return " ";
      }

      return item.value;
    };
  }, [currentPageData]);




  const handlePageChange = (event, newValue) => {
    if (typeof newValue === 'number') {
      setPage(newValue);
    }
  };

  return (
    <Box sx={{ width: '95%' }}>
      <BarChart
        dataset={currentPageData}
        yAxis={[{ dataKey: 'name', width: 200, }]}
        xAxis={[
          {
            colorMap: {
              type: 'continuous',
              min: safeMin,
              max: safeMax,
              color: ['#3A7C89', '#123F5A'],
            },
          },
        ]}
        series={[
          {
            dataKey: `${props.semester === "CGPA" ? "cgpa" : props.semester}`,
            valueFormatter: (value, context) => {
              const name = currentPageData[context.dataIndex]?.name;

              if (hasLettersAndNumbers(name)) {
                return "";
              }

              return value;

            }
          }
        ]}
        layout="horizontal"
        barLabel={getBarLabel}
        slots={{ barLabel: BarLabel }}
        height={300}
      />


      <Typography gutterBottom sx={{ marginLeft: "20%" }}>
        Showing {startIdx + 1} - {Math.min(endIdx, totalItems)} of {totalItems}
      </Typography>
      <Slider
        value={page}
        onChange={handlePageChange}
        min={0}
        max={Math.max(0, totalPages - 1)}
        step={1}
        sx={{ width: "60%", marginLeft: "20%" }}
        marks
      />
    </Box>
  );
}

const Text = styled('text')(() => ({
  stroke: 'none',
  transition: 'opacity 0.2s ease-in, fill 0.2s ease-in',
  textAnchor: 'middle',
  dominantBaseline: 'central',
  pointerEvents: 'none',
}));
function BarLabel(props) {
  const {
    color,
    x,
    y,
    width,
    height,
    skipAnimation,
    ...otherProps
  } = props;

  const animatedProps = useAnimate(
    { x: x + width - 40, y: y + height / 2 + 3 },
    {
      initialProps: { x: x, y: y + height / 2 },
      createInterpolator: interpolateObject,
      transformProps: (p) => p,
      applyProps: (element, p) => {
        element.setAttribute('x', p.x.toString());
        element.setAttribute('y', p.y.toString());
      },
      skip: skipAnimation,
    },
  );

  return (
    <Text {...otherProps} fill="white" textAnchor="start" {...animatedProps} />
  );
}