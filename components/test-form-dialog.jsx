"use client"

import { useState, useEffect } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { useSelector } from "react-redux" // Add Redux import
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Plus, Trash } from "lucide-react"

export default function TestFormDialog({ open, onOpenChange, test = null, onSuccess }) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const { token } = useSelector((state) => state.auth) // Get token from Redux store

  const form = useForm({
    defaultValues: {
      name: "",
      code: "",
      groupName: "",
      price: "",
      parameters: [
        {
          name: "",
          normalRanges: [
            {
              gender: "all",
              minAge: 0,
              maxAge: 150,
              minValue: "",
              maxValue: "",
              unit: "",
            },
          ],
        },
      ],
    },
  })

  const {
    fields: parameterFields,
    append: appendParameter,
    remove: removeParameter,
  } = useFieldArray({
    control: form.control,
    name: "parameters",
  })

  const {
    fields: normalRangesFields0,
    append: appendNormalRanges0,
    remove: removeNormalRanges0,
  } = useFieldArray({
    control: form.control,
    name: `parameters.0.normalRanges`,
  })

  const {
    fields: normalRangesFields1,
    append: appendNormalRanges1,
    remove: removeNormalRanges1,
  } = useFieldArray({
    control: form.control,
    name: `parameters.1.normalRanges`,
  })

  const {
    fields: normalRangesFields2,
    append: appendNormalRanges2,
    remove: removeNormalRanges2,
  } = useFieldArray({
    control: form.control,
    name: `parameters.2.normalRanges`,
  })

  const {
    fields: normalRangesFields3,
    append: appendNormalRanges3,
    remove: removeNormalRanges3,
  } = useFieldArray({
    control: form.control,
    name: `parameters.3.normalRanges`,
  })

  const {
    fields: normalRangesFields4,
    append: appendNormalRanges4,
    remove: removeNormalRanges4,
  } = useFieldArray({
    control: form.control,
    name: `parameters.4.normalRanges`,
  })

  const normalRangesFields = [
    normalRangesFields0,
    normalRangesFields1,
    normalRangesFields2,
    normalRangesFields3,
    normalRangesFields4,
  ]
  const appendNormalRanges = [
    appendNormalRanges0,
    appendNormalRanges1,
    appendNormalRanges2,
    appendNormalRanges3,
    appendNormalRanges4,
  ]
  const removeNormalRanges = [
    removeNormalRanges0,
    removeNormalRanges1,
    removeNormalRanges2,
    removeNormalRanges3,
    removeNormalRanges4,
  ]

  // Load test data if editing
  useEffect(() => {
    if (test) {
      form.reset({
        name: test.name,
        code: test.code || "",
        groupName: test.groupName,
        price: test.price.toString(),
        parameters: test.parameters?.length
          ? test.parameters.map((param) => ({
              name: param.name,
              normalRanges: param.normalRanges?.length
                ? param.normalRanges.map((range) => ({
                    gender: range.gender,
                    minAge: range.minAge,
                    maxAge: range.maxAge,
                    minValue: range.minValue,
                    maxValue: range.maxValue,
                    unit: range.unit,
                  }))
                : [
                    {
                      gender: "all",
                      minAge: 0,
                      maxAge: 150,
                      minValue: "",
                      maxValue: "",
                      unit: "",
                    },
                  ],
            }))
          : [
              {
                name: "",
                normalRanges: [
                  {
                    gender: "all",
                    minAge: 0,
                    maxAge: 150,
                    minValue: "",
                    maxValue: "",
                    unit: "",
                  },
                ],
              },
            ],
      })
    } else {
      form.reset({
        name: "",
        code: "",
        groupName: "",
        price: "",
        parameters: [
          {
            name: "",
            normalRanges: [
              {
                gender: "all",
                minAge: 0,
                maxAge: 150,
                minValue: "",
                maxValue: "",
                unit: "",
              },
            ],
          },
        ],
      })
    }
  }, [test, form])

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      // Convert price to number
      data.price = Number(data.price)

      // Convert age ranges to numbers
      data.parameters.forEach((param) => {
        param.normalRanges.forEach((range) => {
          range.minAge = Number(range.minAge)
          range.maxAge = Number(range.maxAge)
        })
      })

      const url = test ? `http://97.74.90.82:1200/api/tests/${test.id}/` : "http://97.74.90.82:1200/api/tests/"
      const method = test ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Success",
          description: test ? "Test updated successfully" : "Test created successfully",
        })
        onOpenChange(false)
        if (onSuccess) onSuccess()
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to save test",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error saving test:", error)
      toast({
        title: "Error",
        description: "Failed to save test. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{test ? "Edit Test" : "Add New Test"}</DialogTitle>
          <DialogDescription>
            {test ? "Update the test details below" : "Enter the test details below to add a new test"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                rules={{ required: "Test name is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Test Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter test name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Test Code</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter test code (optional)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="groupName"
                rules={{ required: "Group name is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Group Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter group name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                rules={{
                  required: "Price is required",
                  pattern: {
                    value: /^[0-9]+$/,
                    message: "Please enter a valid price",
                  },
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price (₹)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter price" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Parameters</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    appendParameter({
                      name: "",
                      normalRanges: [
                        {
                          gender: "all",
                          minAge: 0,
                          maxAge: 150,
                          minValue: "",
                          maxValue: "",
                          unit: "",
                        },
                      ],
                    })
                  }
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Parameter
                </Button>
              </div>

              {parameterFields.map((field, index) => (
                <div key={field.id} className="border rounded-md p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Parameter {index + 1}</h4>
                    {parameterFields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeParameter(index)}
                        className="text-destructive"
                      >
                        <Trash className="h-4 w-4 mr-2" /> Remove
                      </Button>
                    )}
                  </div>

                  <FormField
                    control={form.control}
                    name={`parameters.${index}.name`}
                    rules={{ required: "Parameter name is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Parameter Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter parameter name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h5 className="text-sm font-medium">Normal Ranges</h5>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          appendNormalRanges[index]({
                            gender: "all",
                            minAge: 0,
                            maxAge: 150,
                            minValue: "",
                            maxValue: "",
                            unit: "",
                          })
                        }
                      >
                        <Plus className="h-4 w-4 mr-2" /> Add Range
                      </Button>
                    </div>

                    {normalRangesFields[index].map((rangeField, rangeIndex) => (
                      <div key={rangeField.id} className="border rounded-md p-4 space-y-4">
                        <div className="flex justify-between items-center">
                          <h6 className="text-sm font-medium">Range {rangeIndex + 1}</h6>
                          {normalRangesFields[index].length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeNormalRanges[index](rangeIndex)}
                              className="text-destructive"
                            >
                              <Trash className="h-4 w-4 mr-2" /> Remove
                            </Button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name={`parameters.${index}.normalRanges.${rangeIndex}.gender`}
                            rules={{ required: "Gender is required" }}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Gender</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select gender" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="all">All</SelectItem>
                                    <SelectItem value="male">Male</SelectItem>
                                    <SelectItem value="female">Female</SelectItem>
                                    <SelectItem value="child">Child</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`parameters.${index}.normalRanges.${rangeIndex}.unit`}
                            rules={{ required: "Unit is required" }}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Unit</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g., g/dL" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`parameters.${index}.normalRanges.${rangeIndex}.minValue`}
                            rules={{ required: "Minimum value is required" }}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Minimum Value</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g., 13.5" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`parameters.${index}.normalRanges.${rangeIndex}.maxValue`}
                            rules={{ required: "Maximum value is required" }}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Maximum Value</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g., 17.5" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`parameters.${index}.normalRanges.${rangeIndex}.minAge`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Min Age (years)</FormLabel>
                                <FormControl>
                                  <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`parameters.${index}.normalRanges.${rangeIndex}.maxAge`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Max Age (years)</FormLabel>
                                <FormControl>
                                  <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : test ? "Update Test" : "Add Test"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
