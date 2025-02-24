import React from 'react'
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { Link } from 'react-router-dom'



const Program = [
  // {
  //   id: 1,
  //   programname: "B.Tech",
  //   url:"https://tse2.mm.bing.net/th?id=OIP.Kakww5t2Fk0r7_1Gwyxi1QHaFN&pid=Api&P=0&h=180"
  // },
  // {
  //   id: 2,
  //   programname: "B.Com",
  //   url:"https://tse1.mm.bing.net/th?id=OIP.QLDLA27WfMRRQE7SB03_SQHaD6&pid=Api&P=0&h=180"
  // },
  // {
  //   id: 3,
  //   programname: "B.Pharma",
  //   url:"https://tse4.mm.bing.net/th?id=OIP.Vp8m-Vhm7x2hkL73KRw6LwHaFh&pid=Api&P=0&h=180"
  // },
]


const ProgramName = () => {
  return (
    <>
      <div className='mt-20 '>
        <div className='flex justify-center'>
          <h2 className=" text-2xl font-bold mb-4">Choose a Program</h2>
        </div>

        
          <div className=' mx-10 gap-4 flex flex-row justify-center flex-wrap md:flex md:justify-start '>
            {Program && Program.length > 0 ? (
              Program.map((program) => (
                <Card className="w-44 overflow-hidden rounded-lg dark:bg-gray-800 bg-white shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300  ">
                  <div className="relative">
                    <img
                      src={program.url}
                      alt="course"
                      className="w-full h-36 object-cover rounded-t-lg"
                    />
                  </div>
                  <CardContent className=' py-2 flex justify-center items-center'>
                    <Link to='/branch'>
                      <h1 className='hover:underline font-bold text-lg truncate'>{program.programname}</h1></Link>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-red-500 text-center w-full">No Programs Found</p>
            )
            }
          </div>
        </div>

    

    </>

  )
}

export default ProgramName
