import React from 'react'
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from '@/components/ui/button'


const questions = [

]

const QuestionsList = () => {
    return (
        <div className='mt-20 px-14'>
            <div>
                        <h1 className="flex justify-center text-2xl font-bold mb-4">CourseName</h1>
 
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[100px]">Type(Mid-Sem/End-Sem)</TableHead>
                        <TableHead>Year</TableHead>
                        <TableHead className="text-right"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {questions && questions.length > 0 ? (
                    questions.map((question) => (
                        <TableRow key={question.question}>
                            <TableCell className="font-medium">{question.Type}</TableCell>
                            <TableCell>{question.Year}</TableCell>
                            <TableCell className="text-right">  <Button>Download</Button> </TableCell>
                        </TableRow>
                    ))
                ) : (
                    <p className="text-red-500 flex justify-center text-center w-full">Questions are not Available </p>
                  )
                  }
                </TableBody>
            </Table>
        </div>
    )
}

export default QuestionsList
